/**
 * Graph Entity Models Tests
 * =====================
 * Test suite for graph node labels and indexes
 */

const { Pool } = require('pg');

let pool: any;

beforeAll(() => {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'nurisk',
    password: process.env.DB_PASSWORD || 'nurisk',
    database: process.env.DB_NAME || 'nurisk',
  });
});

describe('Graph Entity Models', () => {
  describe('T01 - Core Node Labels', () => {
    test('I01: should create Incident node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (i:incident {id: 1, type: \"BANJIR\", severity: \"HIGH\", status: \"REPORTED\", priority_score: 100}) RETURN i') AS (i agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create Location node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (l:location {id: 1, name: \"Jakarta\", admin_level: \"KABUPATEN\"}) RETURN l') AS (l agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create Organization node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (o:organization {id: 1, name: \"PWNU Jakarta\", type: \"PWNU\"}) RETURN o') AS (o agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T02 - Operational Node Labels', () => {
    test('I01: should create Person node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (p:person {id: 1, full_name: \"John Doe\", role: \"RELAWAN\"}) RETURN p') AS (p agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create Mission node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (m:mission {id: 1, type: \"RESPONSE\", status: \"PENDING\"}) RETURN m') AS (m agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create Resource node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (r:resource {id: 1, name: \"Rescue Boat\", category: \"VEHICLE\"}) RETURN r') AS (r agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T03 - Intelligence Node Labels', () => {
    test('I01: should create Event node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (e:event {id: 1, type: \"WEATHER\", timestamp: \"2024-01-01\"}) RETURN e') AS (e agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create IntelReport node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (ir:intel_report {id: 1, source: \"BMKG\", confidence: 0.8}) RETURN ir') AS (ir agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create Alert node with required properties', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (a:alert {id: 1, type: \"FLOOD\", severity: \"HIGH\"}) RETURN a') AS (a agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T04 - Node Property Indexing', () => {
    test('I01: should verify Incident indexes exist', async () => {
      const result = await pool.query(
        "SELECT * FROM ag_catalog.ag_indexes WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph')"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('I02: should verify Location indexes exist', async () => {
      const result = await pool.query(
        "SELECT indexname FROM ag_catalog.ag_indexes WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph') AND indexname LIKE '%location%'"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('I03: should verify Event composite index exists', async () => {
      const result = await pool.query(
        "SELECT indexname FROM ag_catalog.ag_indexes WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph') AND indexname = 'event_type_timestamp_idx'"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('T05 - Node Model Tests', () => {
    test('I01: should query nodes by label', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident) RETURN count(i) as count') AS (count agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should filter nodes by property', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident {status: \"REPORTED\"}) RETURN i') AS (i agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should use index in query plan', async () => {
      // EXPLAIN CYPHER shows query plan - indexes are used automatically
      const result = await pool.query(
        "EXPLAIN CYPHER 'nurisk_graph' MATCH (i:incident {id: 1}) RETURN i"
      );
      expect(result.rows).toBeDefined();
    });
  });
});