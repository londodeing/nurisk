-- Window function for running count of active incidents
-- Active incidents defined as those with status in ('REPORTED', 'IN_PROGRESS', 'UNDER_INVESTIGATION')
SELECT
  recorded_at,
  SUM(CASE 
      WHEN status IN ('REPORTED', 'IN_PROGRESS', 'UNDER_INVESTIGATION') 
      THEN 1 ELSE 0 
    END) OVER (ORDER BY recorded_at ROWS UNBOUNDED PRECEDING) AS active_incidents_running_count
FROM incident_temporal
ORDER BY recorded_at;