-- Graph Relationships (Edge Labels)
-- ==============================
-- Edge label definitions for Apache AGE graph

SET search_path = ag_catalog, "$user", public;

-- ============================================================
-- T01: Spatial Relationships
-- ============================================================

-- I01: NEXT_TO edge between adjacent Location nodes
SELECT ag_catalog.create_elabel('nurisk_graph', 'next_to');

-- Create sample NEXT_TO edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (l1:location {name: 'Jakarta'}), (l2:location {name: 'Tangerang'})
    CREATE (l1)-[n:next_to {distance_km: 25}]->(l2)
    RETURN n
$$) AS (n agtype);

-- I02: WITHIN edge from Incident/Location to parent Location
SELECT ag_catalog.create_elabel('nurisk_graph', 'within');

-- Create sample WITHIN edge (village within district, district within regency)
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (l1:location {name: 'Jakarta'}), (l2:location {name: 'Indonesia'})
    CREATE (l1)-[w:within {level: 'KABUPATEN'}]->(l2)
    RETURN w
$$) AS (w agtype);

-- I03: NEAR edge with distance property for proximity queries
SELECT ag_catalog.create_elabel('nurisk_graph', 'near');

-- Create sample NEAR edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (i:incident {id: 1}), (l:location {name: 'Jakarta'})
    CREATE (i)-[n:near {distance_km: 5.0}]->(l)
    RETURN n
$$) AS (n agtype);

-- ============================================================
-- T02: Operational Relationships
-- ============================================================

-- I01: MANAGES edge from Person to Person (ICS chain of command)
SELECT ag_catalog.create_elabel('nurisk_graph', 'manages');

-- Create sample MANAGES edge (supervisor to subordinate)
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (supervisor:person {full_name: 'Commander'}), (subordinate:person {full_name: 'Field Lead'})
    CREATE (supervisor)-[m:manages {since: '2024-01-01', role: 'INCIDENT_COMMANDER'}]->(subordinate)
    RETURN m
$$) AS (m agtype);

-- I02: DEPLOYED_TO edge from Person to Mission with role and duration
SELECT ag_catalog.create_elabel('nurisk_graph', 'deployed_to');

-- Create sample DEPLOYED_TO edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (p:person {full_name: 'John Doe'}), (m:mission {id: 1})
    CREATE (p)-[d:deployed_to {role: 'TEAM_LEADER', duration_hours: 8, start_time: '2024-01-01'}]->(m)
    RETURN d
$$) AS (d agtype);

-- I03: ASSIGNED_TO edge from Resource to Mission/Incident
SELECT ag_catalog.create_elabel('nurisk_graph', 'assigned_to');

-- Create sample ASSIGNED_TO edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (r:resource {name: 'Rescue Boat'}), (m:mission {id: 1})
    CREATE (r)-[a:assigned_to {quantity: 1, assigned_at: '2024-01-01'}]->(m)
    RETURN a
$$) AS (a agtype);

-- ============================================================
-- T03: Causal and Temporal Relationships
-- ============================================================

-- I01: CAUSED_BY edge from Incident to Incident (cascading disasters)
SELECT ag_catalog.create_elabel('nurisk_graph', 'caused_by');

-- Create sample CAUSED_BY edge (flood caused by heavy rain)
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (flood:incident {type: 'BANJIR'}), (rain:incident {type: 'HUJAN'})
    CREATE (flood)-[c:caused_by {probability: 0.85, time_lag_hours: 6}]->(rain)
    RETURN c
$$) AS (c agtype);

-- I02: AFFECTS edge from Incident to Location with impact_severity
SELECT ag_catalog.create_elabel('nurisk_graph', 'affects');

-- Create sample AFFECTS edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (i:incident {id: 1}), (l:location {name: 'Jakarta'})
    CREATE (i)-[a:affects {impact_severity: 'HIGH', households_affected: 500, refugees: 100}]->(l)
    RETURN a
$$) AS (a agtype);

-- I03: RELATED_TO edge between IntelReport and Incident
SELECT ag_catalog.create_elabel('nurisk_graph', 'related_to');

-- Create sample RELATED_TO edge
SELECT * FROM cypher('nurisk_graph', $$
    MATCH (ir:intel_report {id: 1}), (i:incident {id: 1})
    CREATE (ir)-[r:related_to {relevance: 0.9}]->(i)
    RETURN r
$$) AS (r agtype);

-- ============================================================
-- Additional Relationships
-- ============================================================

-- LOCATED_AT: Incident/Person at Location
SELECT ag_catalog.create_elabel('nurisk_graph', 'located_at');

-- BELONGS_TO: Person belongs to Organization
SELECT ag_catalog.create_elabel('nurisk_graph', 'belongs_to');

-- USES: Incident uses Resource
SELECT ag_catalog.create_elabel('nurisk_graph', 'uses');

-- LEADS: Person leads Mission
SELECT ag_catalog.create_elabel('nurisk_graph', 'leads');

-- TRIGGERS: Event triggers Alert
SELECT ag_catalog.create_elabel('nurisk_graph', 'triggers');

-- VALIDATES: Person validates IntelReport
SELECT ag_catalog.create_elabel('nurisk_graph', 'validates');

-- SHELTERED_AT: Person at Shelter
SELECT ag_catalog.create_elabel('nurisk_graph', 'sheltered_at');

-- STORED_AT: Resource at Location
SELECT ag_catalog.create_elabel('nurisk_graph', 'stored_at');

-- ============================================================
-- Helper Functions for Relationship Queries
-- ============================================================

-- Get all relationships for an incident
CREATE OR REPLACE FUNCTION get_incident_relationships(incident_id INTEGER)
RETURNS TABLE (relationship_type text, target_node text, properties jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        label.name as relationship_type,
        'location' as target_node,
        to_jsonb(e)::jsonb as properties
    FROM cypher('nurisk_graph', $$
        MATCH (i:incident {id: $1})-[r]-(other)
        RETURN r, other
    $$) AS (e agtype, other agtype);
END;
$$;

-- Get chain of command for a person
CREATE OR REPLACE FUNCTION get_chain_of_command(person_name text)
RETURNS TABLE (level int, person_name text, role text)
LANGUAGE plpgsql
AS $$
DECLARE
    current_level int := 0;
    current_person text := person_name;
BEGIN
    RETURN QUERY
    WITH RECURSIVE chain AS (
        SELECT 0 as level, p.full_name, p.role, p.id
        FROM cypher('nurisk_graph', $$
            MATCH (p:person {full_name: $1})
            RETURN p
        $$) AS (full_name text, role text, id agtype)
        UNION ALL
        SELECT c.level + 1, p.full_name, p.role, p.id
        FROM cypher('nurisk_graph', $$
            MATCH (supervisor:person)-[m:manages]->(p:person)
            RETURN supervisor, m, p
        $$) AS (full_name text, role text, id agtype, supervisor text, m agtype)
        WHERE c.level < 5
    )
    SELECT level, full_name, role FROM chain;
END;
$$;

-- Verify all edge labels created
SELECT name, kind, id 
FROM ag_catalog.ag_label 
WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph')
AND kind = 'e'
ORDER BY name;

COMMENT ON EDGE LABEL next_to IS 'Spatial adjacency between locations';
COMMENT ON EDGE LABEL within IS 'Administrative containment';
COMMENT ON EDGE LABEL near IS 'Proximity relationship';
COMMENT ON EDGE LABEL manages IS 'ICS chain of command';
COMMENT ON EDGE LABEL deployed_to IS 'Person deployment to mission';
COMMENT ON EDGE LABEL assigned_to IS 'Resource assignment';
COMMENT ON EDGE LABEL caused_by IS 'Causal relationship between incidents';
COMMENT ON EDGE LABEL affects IS 'Incident impact on location';
COMMENT ON EDGE LABEL related_to IS 'Intel report relevance';