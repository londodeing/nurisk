-- Incident rate per hour using time_bucket
SELECT
  time_bucket('1 hour', recorded_at) AS hour_bucket,
  COUNT(*) AS incident_count
FROM incident_temporal
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour_bucket
ORDER BY hour_bucket;

-- Incident rate per day using time_bucket
SELECT
  time_bucket('1 day', recorded_at) AS day_bucket,
  COUNT(*) AS incident_count
FROM incident_temporal
WHERE recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY day_bucket
ORDER BY day_bucket;

-- Incident rate per week using time_bucket
SELECT
  time_bucket('1 week', recorded_at) AS week_bucket,
  COUNT(*) AS incident_count
FROM incident_temporal
WHERE recorded_at >= NOW() - INTERVAL '90 days'
GROUP BY week_bucket
ORDER BY week_bucket;