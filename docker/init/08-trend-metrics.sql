-- Trend Metrics and Anomaly Detection
-- ==============================
-- Tables and functions for trend analysis and anomaly detection

-- ============================================================
-- T01: Trend Metrics Table
-- ============================================================

-- Create trend_metrics table for daily aggregated metrics
CREATE TABLE IF NOT EXISTS trend_metrics (
    id BIGSERIAL PRIMARY KEY,
    bucket_date DATE NOT NULL,
    disaster_type VARCHAR(100),
    region VARCHAR(100),
    incident_count INTEGER DEFAULT 0,
    avg_severity DECIMAL(5, 2) DEFAULT 0,
    max_severity INTEGER DEFAULT 0,
    total_affected INTEGER DEFAULT 0,
    total_refugees INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    ma_7d DECIMAL(10, 2) DEFAULT 0,
    ma_30d DECIMAL(10, 2) DEFAULT 0,
    std_dev DECIMAL(10, 2) DEFAULT 0,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bucket_date, disaster_type, region)
);

-- Create index for trend queries
CREATE INDEX IF NOT EXISTS idx_trend_metrics_date 
    ON trend_metrics (bucket_date DESC);

CREATE INDEX IF NOT EXISTS idx_trend_metrics_type_date 
    ON trend_metrics (disaster_type, bucket_date DESC);

CREATE INDEX IF NOT EXISTS idx_trend_metrics_region_date 
    ON trend_metrics (region, bucket_date DESC);

CREATE INDEX IF NOT EXISTS idx_trend_metrics_anomaly 
    ON trend_metrics (is_anomaly) WHERE is_anomaly = TRUE;

-- ============================================================
-- T02: Anomaly Log Table
-- ============================================================

-- Create anomaly_log table for detected anomalies
CREATE TABLE IF NOT EXISTS anomaly_log (
    id BIGSERIAL PRIMARY KEY,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    bucket_date DATE NOT NULL,
    disaster_type VARCHAR(100),
    region VARCHAR(100),
    metric_name VARCHAR(100),
    metric_value DECIMAL(10, 2),
    expected_value DECIMAL(10, 2),
    std_deviation DECIMAL(10, 2),
    sigma_level DECIMAL(5, 2),
    severity VARCHAR(20) DEFAULT 'LOW',
    contributing_factors JSONB DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for anomaly queries
CREATE INDEX IF NOT EXISTS idx_anomaly_log_date 
    ON anomaly_log (detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_log_type 
    ON anomaly_log (disaster_type, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_log_severity 
    ON anomaly_log (severity, detected_at DESC);

-- ============================================================
-- T03: Populate Trend Metrics (Daily Job)
-- ============================================================

-- Function to calculate daily trend metrics
CREATE OR REPLACE FUNCTION calculate_daily_trend_metrics()
RETURNS void AS $$
BEGIN
    -- Insert/update daily metrics from incident_temporal
    INSERT INTO trend_metrics (
        bucket_date,
        disaster_type,
        region,
        incident_count,
        avg_severity,
        max_severity,
        total_affected,
        total_refugees,
        resolved_count,
        active_count
    )
    SELECT 
        date_trunc('day', recorded_at)::date AS bucket_date,
        disaster_type,
        region,
        COUNT(*) AS incident_count,
        AVG(severity_score)::DECIMAL(5,2) AS avg_severity,
        MAX(severity_score) AS max_severity,
        SUM(affected_count) AS total_affected,
        SUM(refugee_count) AS total_refugees,
        COUNT(DISTINCT CASE WHEN status = 'RESOLVED' THEN incident_id END) AS resolved_count,
        COUNT(DISTINCT CASE WHEN status = 'ACTIVE' THEN incident_id END) AS active_count
    FROM incident_temporal
    WHERE recorded_at >= date_trunc('day', NOW()) - INTERVAL '1 day'
    AND recorded_at < date_trunc('day', NOW())
    GROUP BY bucket_date, disaster_type, region
    ON CONFLICT (bucket_date, disaster_type, region) 
    DO UPDATE SET
        incident_count = EXCLUDED.incident_count,
        avg_severity = EXCLUDED.avg_severity,
        max_severity = EXCLUDED.max_severity,
        total_affected = EXCLUDED.total_affected,
        total_refugees = EXCLUDED.total_refugees,
        resolved_count = EXCLUDED.resolved_count,
        active_count = EXCLUDED.active_count;

    -- Calculate 7-day moving average
    UPDATE trend_metrics tm
    SET ma_7d = subq.ma_7d
    FROM (
        SELECT 
            bucket_date, disaster_type, region,
            AVG(incident_count) OVER (
                PARTITION BY disaster_type, region 
                ORDER BY bucket_date 
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
            ) AS ma_7d
        FROM trend_metrics
    ) subq
    WHERE tm.bucket_date = subq.bucket_date
    AND tm.disaster_type = subq.disaster_type
    AND tm.region = subq.region
    AND tm.bucket_date >= date_trunc('day', NOW()) - INTERVAL '7 days';

    -- Calculate 30-day moving average
    UPDATE trend_metrics tm
    SET ma_30d = subq.ma_30d
    FROM (
        SELECT 
            bucket_date, disaster_type, region,
            AVG(incident_count) OVER (
                PARTITION BY disaster_type, region 
                ORDER BY bucket_date 
                ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
            ) AS ma_30d
        FROM trend_metrics
    ) subq
    WHERE tm.bucket_date = subq.bucket_date
    AND tm.disaster_type = subq.disaster_type
    AND tm.region = subq.region
    AND tm.bucket_date >= date_trunc('day', NOW()) - INTERVAL '30 days';

    -- Calculate standard deviation
    UPDATE trend_metrics tm
    SET std_dev = subq.std_dev
    FROM (
        SELECT 
            bucket_date, disaster_type, region,
            STDDEV(incident_count) OVER (
                PARTITION BY disaster_type, region 
                ORDER BY bucket_date 
                ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
            ) AS std_dev
        FROM trend_metrics
    ) subq
    WHERE tm.bucket_date = subq.bucket_date
    AND tm.disaster_type = subq.disaster_type
    AND tm.region = subq.region
    AND tm.bucket_date >= date_trunc('day', NOW()) - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- T04: Anomaly Detection (2-sigma)
-- ============================================================

-- Function to detect anomalies using 2-sigma rule
CREATE OR REPLACE FUNCTION detect_anomalies()
RETURNS void AS $$
DECLARE
    rec RECORD;
    mean_val DECIMAL(10, 2);
    std_val DECIMAL(10, 2);
    sigma_val DECIMAL(5, 2);
    severity_val VARCHAR(20);
BEGIN
    -- Get recent metrics and detect anomalies
    FOR rec IN (
        SELECT 
            tm.id,
            tm.bucket_date,
            tm.disaster_type,
            tm.region,
            tm.incident_count,
            tm.ma_30d,
            tm.std_dev
        FROM trend_metrics tm
        WHERE tm.bucket_date >= date_trunc('day', NOW()) - INTERVAL '7 days'
        AND tm.ma_30d > 0
        AND tm.std_dev > 0
    ) LOOP
        -- Calculate sigma level
        sigma_val := ABS(rec.incident_count - rec.ma_30d) / rec.std_dev;
        
        -- Update anomaly flag
        UPDATE trend_metrics 
        SET is_anomaly = sigma_val > 2,
            anomaly_score = sigma_val
        WHERE id = rec.id;
        
        -- Log anomaly if > 2 sigma
        IF sigma_val > 2 THEN
            -- Determine severity
            severity_val := CASE 
                WHEN sigma_val > 3 THEN 'CRITICAL'
                WHEN sigma_val > 2.5 THEN 'HIGH'
                WHEN sigma_val > 2 THEN 'MEDIUM'
                ELSE 'LOW'
            END;
            
            INSERT INTO anomaly_log (
                bucket_date,
                disaster_type,
                region,
                metric_name,
                metric_value,
                expected_value,
                std_deviation,
                sigma_level,
                severity,
                contributing_factors
            ) VALUES (
                rec.bucket_date,
                rec.disaster_type,
                rec.region,
                'incident_count',
                rec.incident_count,
                rec.ma_30d,
                rec.std_dev,
                sigma_val,
                severity_val,
                jsonb_build_object(
                    'ma_7d', (SELECT ma_7d FROM trend_metrics WHERE id = rec.id),
                    'ma_30d', rec.ma_30d,
                    'std_dev', rec.std_dev
                )
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- T05: Seasonality Analysis
-- ============================================================

-- Function to calculate day-of-week patterns
CREATE OR REPLACE FUNCTION get_day_of_week_patterns()
RETURNS TABLE (
    day_of_week INTEGER,
    day_name VARCHAR(20),
    avg_incidents DECIMAL(10, 2),
    std_dev DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(DOW FROM bucket_date)::INTEGER AS day_of_week,
        TO_CHAR(bucket_date, 'Day') AS day_name,
        AVG(incident_count)::DECIMAL(10,2) AS avg_incidents,
        STDDEV(incident_count)::DECIMAL(10,2) AS std_dev
    FROM trend_metrics
    WHERE bucket_date >= date_trunc('day', NOW()) - INTERVAL '90 days'
    GROUP BY day_of_week
    ORDER BY day_of_week;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate month patterns
CREATE OR REPLACE FUNCTION get_month_patterns()
RETURNS TABLE (
    month_num INTEGER,
    month_name VARCHAR(20),
    avg_incidents DECIMAL(10, 2),
    std_dev DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(MONTH FROM bucket_date)::INTEGER AS month_num,
        TO_CHAR(bucket_date, 'Month') AS month_name,
        AVG(incident_count)::DECIMAL(10,2) AS avg_incidents,
        STDDEV(incident_count)::DECIMAL(10,2) AS std_dev
    FROM trend_metrics
    WHERE bucket_date >= date_trunc('day', NOW()) - INTERVAL '365 days'
    GROUP BY month_num
    ORDER BY month_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- T06: Scheduled Jobs
-- ============================================================

-- Create cron job for daily trend calculation (runs at midnight)
SELECT cron.schedule(
    'daily-trend-metrics',
    '0 0 * * *',
    'SELECT calculate_daily_trend_metrics()'
);

-- Create cron job for anomaly detection (runs every hour)
SELECT cron.schedule(
    'hourly-anomaly-detection',
    '0 * * * *',
    'SELECT detect_anomalies()'
);

-- ============================================================
-- Verify Tables
-- ============================================================

SELECT 'trend_metrics' as table_name, count(*) as rows 
FROM trend_metrics;

SELECT 'anomaly_log' as table_name, count(*) as rows 
FROM anomaly_log;

COMMENT ON TABLE trend_metrics IS 'Daily trend metrics with moving averages';
COMMENT ON TABLE anomaly_log IS 'Detected anomalies using 2-sigma rule';
COMMENT ON FUNCTION calculate_daily_trend_metrics IS 'Calculates daily MA and std dev';
COMMENT ON FUNCTION detect_anomalies IS 'Detects anomalies using 2-sigma rule';