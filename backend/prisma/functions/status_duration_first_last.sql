-- Calculate status duration using first/last aggregates
-- For each incident, find how long it spent in each status
SELECT
  incident_id,
  status,
  -- Calculate duration between first and last occurrence of each status
  EXTRACT(EPOCH FROM (last_recorded_at - first_recorded_at)) / 3600 AS duration_hours
FROM (
  SELECT
    incident_id,
    status,
    MIN(recorded_at) OVER (PARTITION BY incident_id, status) AS first_recorded_at,
    MAX(recorded_at) OVER (PARTITION BY incident_id, status) AS last_recorded_at
  FROM incident_temporal
) status_periods
WHERE first_recorded_at IS NOT NULL AND last_recorded_at IS NOT NULL
ORDER BY incident_id, status;