-- Graph Property Indexes
-- ==================
-- Index definitions for Apache AGE graph

SET search_path = ag_catalog, "$user", public;

-- ============================================================
-- T04: Node Property Indexing
-- ============================================================

-- I01: Incident indexes
-- Index on Incident(id) for primary lookups
CREATE INDEX IF NOT EXISTS incident_id_idx 
ON nurisk_graph USING age (incident.id);

-- Index on Incident(status) for status filtering
CREATE INDEX IF NOT EXISTS incident_status_idx 
ON nurisk_graph USING age (incident.status);

-- Index on Incident(priority_score) for sorting
CREATE INDEX IF NOT EXISTS incident_priority_idx 
ON nurisk_graph USING age (incident.priority_score);

-- Index on Incident(region) for region filtering
CREATE INDEX IF NOT EXISTS incident_region_idx 
ON nurisk_graph USING age (incident.region);

-- Index on Incident(disaster_type) for type filtering
CREATE INDEX IF NOT EXISTS incident_type_idx 
ON nurisk_graph USING age (incident.type);

-- I02: Location indexes
-- Index on Location(name) for name lookups
CREATE INDEX IF NOT EXISTS location_name_idx 
ON nurisk_graph USING age (location.name);

-- Index on Location(admin_level) for admin level filtering
CREATE INDEX IF NOT EXISTS location_admin_level_idx 
ON nurisk_graph USING age (location.admin_level);

-- Index on Location(region) for region filtering
CREATE INDEX IF NOT EXISTS location_region_idx 
ON nurisk_graph USING age (location.region);

-- I03: Event indexes
-- Composite index on Event(type, timestamp)
CREATE INDEX IF NOT EXISTS event_type_timestamp_idx 
ON nurisk_graph USING age (event.type, event.timestamp);

-- Index on Event(timestamp) for time filtering
CREATE INDEX IF NOT EXISTS event_timestamp_idx 
ON nurisk_graph USING age (event.timestamp);

-- Index on Event(region) for region filtering
CREATE INDEX IF NOT EXISTS event_region_idx 
ON nurisk_graph USING age (event.region);

-- ============================================================
-- Additional Indexes
-- ============================================================

-- Person indexes
CREATE INDEX IF NOT EXISTS person_role_idx 
ON nurisk_graph USING age (person.role);

CREATE INDEX IF NOT EXISTS person_region_idx 
ON nurisk_graph USING age (person.region);

CREATE INDEX IF NOT EXISTS person_status_idx 
ON nurisk_graph USING age (person.status);

-- Organization indexes
CREATE INDEX IF NOT EXISTS org_name_idx 
ON nurisk_graph USING age (organization.name);

CREATE INDEX IF NOT EXISTS org_type_idx 
ON nurisk_graph USING age (organization.type);

CREATE INDEX IF NOT EXISTS org_region_idx 
ON nurisk_graph USING age (organization.region);

-- Mission indexes
CREATE INDEX IF NOT EXISTS mission_status_idx 
ON nurisk_graph USING age (mission.status);

CREATE INDEX IF NOT EXISTS mission_type_idx 
ON nurisk_graph USING age (mission.type);

CREATE INDEX IF NOT EXISTS mission_priority_idx 
ON nurisk_graph USING age (mission.priority);

-- Alert indexes
CREATE INDEX IF NOT EXISTS alert_type_idx 
ON nurisk_graph USING age (alert.type);

CREATE INDEX IF NOT EXISTS alert_severity_idx 
ON nurisk_graph USING age (alert.severity);

CREATE INDEX IF NOT EXISTS alert_status_idx 
ON nurisk_graph USING age (alert.status);

CREATE INDEX IF NOT EXISTS alert_region_idx 
ON nurisk_graph USING age (alert.region);

-- IntelReport indexes
CREATE INDEX IF NOT EXISTS intel_source_idx 
ON nurisk_graph USING age (intel_report.source);

CREATE INDEX IF NOT EXISTS intel_confidence_idx 
ON nurisk_graph USING age (intel_report.confidence);

-- Resource indexes
CREATE INDEX IF NOT EXISTS resource_category_idx 
ON nurisk_graph USING age (resource.category);

CREATE INDEX IF NOT EXISTS resource_status_idx 
ON nurisk_graph USING age (resource.status);

-- Verify indexes created
SELECT labelname, indexname, attname
FROM ag_catalog.ag_indexes
WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph');

COMMENT ON INDEX incident_id_idx IS 'Primary index on Incident(id)';
COMMENT ON INDEX incident_status_idx IS 'Index on Incident(status) for filtering';
COMMENT ON event_type_timestamp_idx IS 'Composite index on Event(type, timestamp)';