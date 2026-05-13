CREATE OR REPLACE FUNCTION sync_incident_nodes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete existing Incident nodes
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Incident) DELETE n
    $$) AS (v agtype);

    -- Create new Incident nodes from the incidents table
    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Incident $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(incidents)::jsonb) FROM incidents);
END;
$$;

CREATE OR REPLACE FUNCTION sync_location_organization_person_nodes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Location: delete existing and create from distinct lat/long
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Location) DELETE n
    $$) AS (v agtype);

    -- Get distinct lat/long from multiple sources
    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $points AS points
        UNWIND points AS point
        CREATE (n:Location {latitude: point.latitude, longitude: point.longitude})
    $$) AS (v agtype)
    USING 
        points := (
            SELECT jsonb_agg(jsonb_build_object(
                'latitude', latitude,
                'longitude', longitude
            )) 
            FROM (
                SELECT latitude, longitude FROM incidents
                UNION
                SELECT latitude, longitude FROM volunteers
                UNION
                SELECT latitude, longitude FROM shelters
                UNION
                SELECT latitude, longitude FROM volunteer_locations
            ) AS combined
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            GROUP BY latitude, longitude
        );

    -- Organization: delete existing and create from organizations table
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Organization) DELETE n
    $$) AS (v agtype);

    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Organization $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(org)::jsonb) FROM organizations org);

    -- Person: delete existing and create from users table
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Person) DELETE n
    $$) AS (v agtype);

    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Person $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(user)::jsonb) FROM users "user");
END;
$$;

CREATE OR REPLACE FUNCTION sync_resource_event_nodes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Resource: delete existing and create from shelters and inventory
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Resource) DELETE n
    $$) AS (v agtype);

    -- From shelters
    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Resource $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(s)::jsonb) FROM shelters s);

    -- From inventory
    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Resource $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(i)::jsonb) FROM inventory i);

    -- Event: delete existing and create from historical_disasters
    PERFORM * FROM cypher('nurisk_graph', $$
        MATCH (n:Event) DELETE n
    $$) AS (v agtype);

    PERFORM * FROM cypher('nurisk_graph', $$
        WITH $rows AS rows
        UNWIND rows AS row
        CREATE (n:Event $row)
    $$) AS (v agtype)
    USING 
        rows := (SELECT jsonb_agg(row_to_json(h)::jsonb) FROM historical_disasters h);
END;
$$;

-- Cypher Query Wrapper Functions for Graph Analysis
-- T04-task-t04: Write Cypher query wrapper functions

CREATE OR REPLACE FUNCTION findShortestPath(fromNodeType text, toNodeType text)
RETURNS TABLE (path agtype)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    EXECUTE format(
        'SELECT * FROM cypher(%I, $$
            MATCH (a:%s), (b:%s)
            WITH a, b
            MATCH p = shortestPath((a)-[*..20]-(b))
            RETURN p
        $$) AS (p agtype)',
        'nurisk_graph', fromNodeType, toNodeType
    );
END;
$$;

CREATE OR REPLACE FUNCTION findProximityNodes(nodeId bigint, hops integer)
RETURNS TABLE (node agtype, distance integer)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    EXECUTE format(
        'SELECT * FROM cypher(%I, $$
            MATCH (n), (m)
            WHERE id(n) = $1
            WITH n, m
            MATCH p = shortestPath((n)-[*..%s]-(m))
            WITH m, length(p) AS distance
            WHERE distance <= $2
            RETURN m AS node, distance
            ORDER BY distance
        $$) AS (node agtype, distance integer)',
        'nurisk_graph', hops, hops
    ) USING nodeId, hops;
END;
$$;

CREATE OR REPLACE FUNCTION getGraphConnectivity(limitCount integer DEFAULT 100)
RETURNS TABLE (node_type text, node_count bigint, avg_relationships double precision)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    EXECUTE format(
        'SELECT * FROM cypher(%I, $$
            MATCH (n)
            WITH labels(n)[0] AS node_type, count(*) AS node_count, avg(size((n)--())) AS avg_relationships
            RETURN node_type, node_count, avg_relationships
            ORDER BY node_count DESC
            LIMIT $1
        $$) AS (node_type text, node_count bigint, avg_relationships double precision)',
        'nurisk_graph'
    ) USING limitCount;
END;
$$;