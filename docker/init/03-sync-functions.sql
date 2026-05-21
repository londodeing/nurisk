-- Graph Synchronization Functions
-- ============================
-- Functions to sync data from relational tables to AGE graph

-- Set search path
SET search_path = ag_catalog, "$user", public;

-- I01: Sync incidents to graph
-- =======================
CREATE OR REPLACE FUNCTION sync_incidents_to_graph()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    vertex_id agtype;
BEGIN
    FOR rec IN 
        SELECT id, title, disaster_type, latitude, longitude, region, status, priority_score, priority_level, created_at
        FROM incidents
    LOOP
        -- Use Cypher to create vertex
        vertex_id := (
            SELECT * FROM cypher('nurisk_graph', $$
                CREATE (i:incident {
                    id: $1,
                    title: $2,
                    disaster_type: $3,
                    latitude: $4,
                    longitude: $5,
                    region: $6,
                    status: $7,
                    priority_score: $8,
                    priority_level: $9,
                    created_at: $10
                })
                RETURN id
            $$) AS (id agtype)
        );
    END LOOP;
    
    RAISE NOTICE 'Synced % incidents to graph', COALESCE(vertex_id, 0);
END;
$$;

-- I02: Sync locations to graph
-- =======================
CREATE OR REPLACE FUNCTION sync_locations_to_graph()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    vertex_id agtype;
BEGIN
    FOR rec IN 
        SELECT DISTINCT region, latitude, longitude
        FROM incidents
        WHERE region IS NOT NULL
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    LOOP
        vertex_id := (
            SELECT * FROM cypher('nurisk_graph', $$
                CREATE (l:location {
                    name: $1,
                    latitude: $2,
                    longitude: $3
                })
                RETURN id
            $$) AS (id agtype)
        );
    END LOOP;
    
    RAISE NOTICE 'Synced locations to graph';
END;
$$;

-- I03: Sync organizations to graph
-- ================================
CREATE OR REPLACE FUNCTION sync_organizations_to_graph()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
    vertex_id agtype;
BEGIN
    -- Create main organization vertices
    FOR rec IN 
        SELECT DISTINCT region
        FROM volunteers
        WHERE region IS NOT NULL
    LOOP
        vertex_id := (
            SELECT * FROM cypher('nurisk_graph', $$
                CREATE (o:organization {
                    name: $1,
                    type: 'REGION'
                })
                RETURN id
            $$) AS (id agtype)
        );
    END LOOP;
    
    -- Create volunteer vertices and link to organizations
    FOR rec IN 
        SELECT v.id, v.full_name, v.region, v.expertise, v.status
        FROM volunteers v
    LOOP
        vertex_id := (
            SELECT * FROM cypher('nurisk_graph', $$
                MATCH (o:organization {name: $2})
                CREATE (v:volunteer {
                    id: $1,
                    name: $2,
                    expertise: $3,
                    status: $4
                })
                CREATE (v)-[:belongs_to]->(o)
                RETURN id
            $$) AS (id agtype)
        );
    END LOOP;
    
    RAISE NOTICE 'Synced organizations to graph';
END;
$$;

-- Sync all data to graph
-- =====================
CREATE OR REPLACE FUNCTION sync_all_to_graph()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM sync_incidents_to_graph();
    PERFORM sync_locations_to_graph();
    PERFORM sync_organizations_to_graph();
    RAISE NOTICE 'All data synced to graph';
END;
$$;

-- Query: Get incident with location
-- =========================
CREATE OR REPLACE FUNCTION get_incident_graph(incident_id INTEGER)
RETURNS TABLE (incident_data jsonb, location_data jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(i)::jsonb,
        to_jsonb(l)::jsonb
    FROM cypher('nurisk_graph', $$
        MATCH (i:incident {id: $1})-[l:located_at]->(loc:location)
        RETURN i, loc
    $$) AS (incident_data jsonb, location_data jsonb);
END;
$$;