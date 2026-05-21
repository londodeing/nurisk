-- TimescaleDB Hypertables
-- ======================
-- Time-series tables for incident temporal data

-- ============================================================
-- T01: Create incident temporal hypertable
-- ============================================================

-- I01: Create incident_temporal table with snapshot of incident state at time
CREATE TABLE IF NOT EXISTS incident_temporal (
    id BIGSERIAL,
    incident_id INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50),
    disaster_type VARCHAR(100),
    severity_score INTEGER,
    priority_level VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region VARCHAR(100),
    kecamatan VARCHAR(100),
    desa VARCHAR(100),
    affected_count INTEGER DEFAULT 0,
    refugee_count INTEGER DEFAULT 0,
    resource_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- I02: Convert to hypertable partitioned by recorded_at (1-day chunks)
SELECT create_hypertable(
    'incident_temporal', 
    'recorded_at',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- I03: Add indexes on (incident_id, recorded_at DESC) and (status, recorded_at)
CREATE INDEX IF NOT EXISTS idx_incident_temporal_id_time 
    ON incident_temporal (incident_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_temporal_status_time 
    ON incident_temporal (status, recorded_at);

CREATE INDEX IF NOT EXISTS idx_incident_temporal_type_time 
    ON incident_temporal (disaster_type, recorded_at);

CREATE INDEX IF NOT EXISTS idx_incident_temporal_region_time 
    ON incident_temporal (region, recorded_at);

-- ============================================================
-- T02: Create continuous aggregates
-- ============================================================

-- I01: Create hourly aggregate view
CREATE MATERIALIZED VIEW IF NOT EXISTS incident_hourly_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', recorded_at) AS bucket,
    disaster_type AS incident_type,
    COUNT(*) AS incident_count,
    AVG(severity_score) AS avg_severity,
    SUM(affected_count) AS total_affected,
    SUM(refugee_count) AS total_refugees,
    COUNT(DISTINCT incident_id) AS unique_incidents,
    mode() WITHIN GROUP (ORDER BY status) AS most_common_status
FROM incident_temporal
GROUP BY bucket, disaster_type
WITH NO DATA;

-- Set refresh_lag to ensure aggregates are at most 1 hour stale
ALTER MATERIALIZED VIEW incident_hourly_stats
SET (timescaledb.refresh_lag = INTERVAL '1 hour');

-- I02: Create daily aggregate view
CREATE MATERIALIZED VIEW IF NOT EXISTS incident_daily_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', recorded_at) AS bucket,
    disaster_type AS incident_type,
    region,
    COUNT(*) AS total_snapshots,
    COUNT(DISTINCT incident_id) AS new_incidents,
    COUNT(DISTINCT CASE WHEN status = 'RESOLVED' THEN incident_id END) AS resolved_count,
    COUNT(DISTINCT CASE WHEN status = 'ACTIVE' THEN incident_id END) AS active_count,
    MAX(severity_score) AS peak_severity,
    AVG(severity_score) AS avg_severity,
    SUM(affected_count) AS total_affected,
    SUM(refugee_count) AS total_refugees
FROM incident_temporal
GROUP BY bucket, disaster_type, region
WITH NO DATA;

ALTER MATERIALIZED VIEW incident_daily_stats
SET (timescaledb.refresh_lag = INTERVAL '1 hour');

-- I03: Create refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy(
    'incident_hourly_stats',
    start_offset => INTERVAL '2 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);

SELECT add_continuous_aggregate_policy(
    'incident_daily_stats',
    start_offset => INTERVAL '2 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);

-- ============================================================
-- T03: Create data retention and compression
-- ============================================================

-- I01: Enable native compression with segment_by = incident_id after 7 days
ALTER TABLE incident_temporal SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'incident_id'
);

-- Add compression policy to compress chunks older than 7 days
SELECT add_compression_policy(
    'incident_temporal',
    compress_after => INTERVAL '7 days'
);

-- I02: Add retention policy to drop raw data after 365 days
SELECT add_retention_policy(
    'incident_temporal',
    drop_after => INTERVAL '365 days'
);

-- I03: Keep daily aggregates indefinitely (no retention policy)
-- Daily aggregates are kept for long-term trend analysis

-- ============================================================
-- Additional: Real-time view for recent data
-- ============================================================

-- Create real-time aggregate for last 24 hours (not compressed)
CREATE MATERIALIZED VIEW IF NOT EXISTS incident_realtime_stats
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT 
    time_bucket('15 minutes', recorded_at) AS bucket,
    disaster_type AS incident_type,
    COUNT(*) AS incident_count,
    AVG(severity_score) AS avg_severity,
    SUM(affected_count) AS total_affected,
    SUM(refugee_count) AS total_refugees
FROM incident_temporal
WHERE recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY bucket, disaster_type
WITH NO DATA;

-- ============================================================
-- Helper Functions
-- ============================================================

-- Function to insert incident snapshot
CREATE OR REPLACE FUNCTION record_incident_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO incident_temporal (
        incident_id,
        recorded_at,
        status,
        disaster_type,
        severity_score,
        priority_level,
        latitude,
        longitude,
        region,
        kecamatan,
        desa,
        affected_count,
        refugee_count,
        resource_count
    ) VALUES (
        NEW.id,
        NOW(),
        NEW.status,
        NEW.disaster_type,
        NEW.priority_score,
        NEW.priority_level,
        NEW.latitude,
        NEW.longitude,
        NEW.region,
        NEW.kecamatan,
        NEW.desa,
        COALESCE(NEW.needs_numeric->>'affected_count', '0')::INTEGER,
        COALESCE(NEW.needs_numeric->>'refugee_count', '0')::INTEGER,
        COALESCE(NEW.needs_numeric->>'resource_count', '0')::INTEGER
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-record incident state changes
DROP TRIGGER IF EXISTS incident_snapshot_trigger ON incidents;
CREATE TRIGGER incident_snapshot_trigger
    AFTER INSERT OR UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION record_incident_snapshot();

-- ============================================================
-- Verify hypertable and policies
-- ============================================================

-- Check hypertable
SELECT 
    hypertable_name,
    chunk_time_interval,
    compression_enabled,
    segmentby
FROM timescaledb.hypertables
WHERE hypertable_name = 'incident_temporal';

-- Check continuous aggregates
SELECT 
    view_name,
    materialized_only,
    refresh_lag,
    refresh_interval
FROM timescaledb.continuous_aggregates
WHERE view_name IN ('incident_hourly_stats', 'incident_daily_stats');

-- Check compression policy
SELECT 
    hypertable_name,
    compress_after,
    segmentby
FROM timescaledb.compression_policies
WHERE hypertable_name = 'incident_temporal';

-- Check retention policy
SELECT 
    hypertable_name,
    drop_after
FROM timescaledb.retention_policies
WHERE hypertable_name = 'incident_temporal';

COMMENT ON TABLE incident_temporal IS 'Time-series snapshot of incident states for historical analysis';
COMMENT ON MATERIALIZED VIEW incident_hourly_stats IS 'Hourly aggregated incident statistics';
COMMENT ON MATERIALIZED VIEW incident_daily_stats IS 'Daily aggregated incident statistics';