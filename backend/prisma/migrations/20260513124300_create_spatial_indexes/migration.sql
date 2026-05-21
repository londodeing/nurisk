-- Create GiST indexes on all geography(Point, 4326) columns for spatial query performance
-- GiST indexes are required for PostGIS spatial operators (ST_DWithin, ST_Distance, etc.)

-- Volunteer location
CREATE INDEX IF NOT EXISTS "Volunteer_location_idx" ON "Volunteer" USING GIST ("location");

-- Incident location
CREATE INDEX IF NOT EXISTS "Incident_location_idx" ON "Incident" USING GIST ("location");

-- Shelter location
CREATE INDEX IF NOT EXISTS "Shelter_location_idx" ON "Shelter" USING GIST ("location");

-- Warehouse location
CREATE INDEX IF NOT EXISTS "Warehouse_location_idx" ON "Warehouse" USING GIST ("location");

-- Asset location
CREATE INDEX IF NOT EXISTS "Asset_location_idx" ON "Asset" USING GIST ("location");

-- HistoricalDisaster location
CREATE INDEX IF NOT EXISTS "HistoricalDisaster_location_idx" ON "HistoricalDisaster" USING GIST ("location");

-- Report location
CREATE INDEX IF NOT EXISTS "Report_location_idx" ON "Report" USING GIST ("location");

-- Mission location
CREATE INDEX IF NOT EXISTS "Mission_location_idx" ON "Mission" USING GIST ("location");

-- VolunteerDeployment checkInLocation
CREATE INDEX IF NOT EXISTS "VolunteerDeployment_checkInLocation_idx" ON "VolunteerDeployment" USING GIST ("checkInLocation");

-- CheckIn location
CREATE INDEX IF NOT EXISTS "CheckIn_location_idx" ON "CheckIn" USING GIST ("location");

-- BuildingAssessment location
CREATE INDEX IF NOT EXISTS "BuildingAssessment_location_idx" ON "BuildingAssessment" USING GIST ("location");

-- CommandPost location
CREATE INDEX IF NOT EXISTS "CommandPost_location_idx" ON "CommandPost" USING GIST ("location");

-- IntelReport location
CREATE INDEX IF NOT EXISTS "IntelReport_location_idx" ON "IntelReport" USING GIST ("location");

-- Composite GiST index on Shelter(incidentId, location) for spatial queries filtering by incident
CREATE INDEX IF NOT EXISTS "Shelter_incidentId_location_idx" ON "Shelter" USING GIST ("incidentId", "location");

-- Composite GiST index on Incident(status, location) for active-incident geofencing
CREATE INDEX IF NOT EXISTS "Incident_status_location_idx" ON "Incident" USING GIST ("status", "location");
