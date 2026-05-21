-- Create incident_temporal table
CREATE TABLE public.incident_temporal (
    incident_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convert incident_temporal to hypertable
SELECT create_hypertable('incident_temporal', 'recorded_at');

-- Create resource_utilization table for asset usage over time
CREATE TABLE public.resource_utilization (
    asset_id INTEGER NOT NULL,
    utilization_percent DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resource_type VARCHAR(50) NOT NULL
);

-- Convert resource_utilization to hypertable
SELECT create_hypertable('resource_utilization', 'recorded_at');

-- I01: Add compression policy on incident_temporal after 7 days
ALTER TABLE incident_temporal SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'incident_id, status, severity',
  timescaledb.compress_order_by = 'recorded_at DESC'
);
SELECT add_compression_policy('incident_temporal', INTERVAL '7 days');

-- I02: Add retention policy to drop raw data older than 365 days
SELECT add_retention_policy('incident_temporal', INTERVAL '365 days');

-- I03: Add continuous aggregate for hourly and daily rollup views
CREATE MATERIALIZED VIEW incident_temporal_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', recorded_at) AS bucket,
  incident_id,
  status,
  severity,
  COUNT(*) AS incident_count
FROM incident_temporal
GROUP BY bucket, incident_id, status, severity;

CREATE MATERIALIZED VIEW incident_temporal_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', recorded_at) AS bucket,
  incident_id,
  status,
  severity,
  COUNT(*) AS incident_count
FROM incident_temporal
GROUP BY bucket, incident_id, status, severity;