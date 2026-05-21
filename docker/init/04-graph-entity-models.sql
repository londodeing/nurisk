-- Graph Entity Models
-- ==================
-- Node label definitions for Apache AGE graph

SET search_path = ag_catalog, "$user", public;

-- ============================================================
-- T01: Core Node Labels
-- ============================================================

-- I01: Incident node label
-- Properties: id, type, severity, timestamp, status, location, description
SELECT ag_catalog.create_vlabel('nurisk_graph', 'incident');

-- Add properties to Incident using Cypher
SELECT * FROM cypher('nurisk_graph', $$
    CREATE (i:incident {
        id: 0,
        type: 'BANJIR',
        severity: 'LOW',
        status: 'REPORTED',
        latitude: 0.0,
        longitude: 0.0,
        region: '',
        priority_score: 0,
        priority_level: 'LOW',
        description: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
    })
    RETURN i
$$) AS (i agtype);

-- I02: Location node label
-- Properties: id, name, admin_level, geometry, region
SELECT ag_catalog.create_vlabel('nurisk_graph', 'location');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (l:location {
        id: 0,
        name: '',
        admin_level: 'KABUPATEN',
        latitude: 0.0,
        longitude: 0.0,
        region: '',
        geom: '{}'
    })
    RETURN l
$$) AS (l agtype);

-- I03: Organization node label
-- Properties: id, name, type, region, contact
SELECT ag_catalog.create_vlabel('nurisk_graph', 'organization');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (o:organization {
        id: 0,
        name: '',
        type: 'PWNU',
        region: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        status: 'AKTIF'
    })
    RETURN o
$$) AS (o agtype);

-- ============================================================
-- T02: Operational Node Labels
-- ============================================================

-- I01: Person node label (volunteers, staff)
-- Properties: id, name, role, skills, status, region
SELECT ag_catalog.create_vlabel('nurisk_graph', 'person');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (p:person {
        id: 0,
        full_name: '',
        role: 'RELAWAN',
        expertise: '',
        skills: '[]',
        phone: '',
        email: '',
        status: 'approved',
        region: '',
        latitude: 0.0,
        longitude: 0.0,
        created_at: '2024-01-01'
    })
    RETURN p
$$) AS (p agtype);

-- I02: Mission node label
-- Properties: id, type, start, end, status, priority
SELECT ag_catalog.create_vlabel('nurisk_graph', 'mission');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (m:mission {
        id: 0,
        type: 'RESPONSE',
        title: '',
        description: '',
        start_time: '2024-01-01',
        end_time: '2024-01-01',
        status: 'PENDING',
        priority: 'LOW',
        assigned_to: 0,
        incident_id: 0
    })
    RETURN m
$$) AS (m agtype);

-- I03: Resource node label
-- Properties: id, type, quantity, location, status
SELECT ag_catalog.create_vlabel('nurisk_graph', 'resource');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (r:resource {
        id: 0,
        name: '',
        category: 'VEHICLE',
        quantity: 0,
        unit: '',
        location: '',
        warehouse_id: 0,
        status: 'available',
        qr_code: ''
    })
    RETURN r
$$) AS (r agtype);

-- ============================================================
-- T03: Intelligence Node Labels
-- ============================================================

-- I01: Event node label for temporal events
-- Properties: id, type, timestamp, duration, location
SELECT ag_catalog.create_vlabel('nurisk_graph', 'event');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (e:event {
        id: 0,
        type: 'WEATHER',
        title: '',
        description: '',
        timestamp: '2024-01-01',
        duration_minutes: 0,
        latitude: 0.0,
        longitude: 0.0,
        region: ''
    })
    RETURN e
$$) AS (e agtype);

-- I02: IntelReport node label
-- Properties: id, source, confidence, content, timestamp
SELECT ag_catalog.create_vlabel('nurisk_graph', 'intel_report');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (ir:intel_report {
        id: 0,
        source: '',
        confidence: 0.0,
        content: '',
        type: 'GENERAL',
        incident_id: 0,
        created_at: '2024-01-01',
        validated: false
    })
    RETURN ir
$$) AS (ir agtype);

-- I03: Alert node label for warnings
-- Properties: id, type, severity, effective_period, status
SELECT ag_catalog.create_vlabel('nurisk_graph', 'alert');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (a:alert {
        id: 0,
        type: 'FLOOD',
        severity: 'LOW',
        title: '',
        description: '',
        effective_from: '2024-01-01',
        effective_until: '2024-01-01',
        status: 'ACTIVE',
        region: '',
        latitude: 0.0,
        longitude: 0.0
    })
    RETURN a
$$) AS (a agtype);

-- ============================================================
-- Additional Node Labels
-- ============================================================

-- Shelter node label
SELECT ag_catalog.create_vlabel('nurisk_graph', 'shelter');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (s:shelter {
        id: 0,
        name: '',
        region: '',
        address: '',
        capacity: 0,
        current_occupants: 0,
        status: 'AKTIF',
        latitude: 0.0,
        longitude: 0.0
    })
    RETURN s
$$) AS (s agtype);

-- Asset node label
SELECT ag_catalog.create_vlabel('nurisk_graph', 'asset');

SELECT * FROM cypher('nurisk_graph', $$
    CREATE (a:asset {
        id: 0,
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        location: '',
        status: 'available'
    })
    RETURN a
$$) AS (a agtype);

-- Verify all labels created
SELECT name, kind, id 
FROM ag_catalog.ag_label 
WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph')
ORDER BY kind, name;

COMMENT ON VERTEX LABEL incident IS 'Disaster incident nodes with location and severity';
COMMENT ON VERTEX LABEL location IS 'Geographic locations with admin boundaries';
COMMENT ON VERTEX LABEL organization IS 'NU organization hierarchy';
COMMENT ON VERTEX LABEL person IS 'Volunteers and staff';
COMMENT ON VERTEX LABEL mission IS 'Response missions';
COMMENT ON VERTEX LABEL resource IS 'Response resources';
COMMENT ON VERTEX LABEL event IS 'Temporal events';
COMMENT ON VERTEX LABEL intel_report IS 'Intelligence reports';
COMMENT ON VERTEX LABEL alert IS 'Warning alerts';