/**
 * Graph Relationships Tests
 * ====================
 * Test suite for graph edge labels and relationships
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

describe('Graph Relationships', () => {
  describe('T01 - Spatial Relationships', () => {
    test('I01: should create NEXT_TO edge between locations', async () => {
      // First create location nodes
      await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (l1:location {id: 1, name: \"Jakarta\"}), (l2:location {id: 2, name: \"Tangerang\"}) RETURN l1, l2') AS (l1 agtype, l2 agtype)"
      );
      
      // Create NEXT_TO edge
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (l1:location {name: \"Jakarta\"}), (l2:location {name: \"Tangerang\"}) CREATE (l1)-[n:next_to {distance_km: 25}]->(l2) RETURN n') AS (n agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create WITHIN edge for admin hierarchy', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (l1:location {name: \"Jakarta\"}), (l2:location {name: \"Indonesia\"}) CREATE (l1)-[w:within {level: \"KABUPATEN\"}]->(l2) RETURN w') AS (w agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create NEAR edge with distance', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident {id: 1}), (l:location {name: \"Jakarta\"}) CREATE (i)-[n:near {distance_km: 5.0}]->(l) RETURN n') AS (n agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T02 - Operational Relationships', () => {
    test('I01: should create MANAGES edge for chain of command', async () => {
      // First create person nodes
      await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (p1:person {id: 1, full_name: \"Commander\"}), (p2:person {id: 2, full_name: \"Field Lead\"}) RETURN p1, p2') AS (p1 agtype, p2 agtype)"
      );
      
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (supervisor:person {full_name: \"Commander\"}), (subordinate:person {full_name: \"Field Lead\"}) CREATE (supervisor)-[m:manages {since: \"2024-01-01\"}]->(subordinate) RETURN m') AS (m agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create DEPLOYED_TO edge with role', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (p:person {full_name: \"John Doe\"}), (m:mission {id: 1}) CREATE (p)-[d:deployed_to {role: \"TEAM_LEADER\"}]->(m) RETURN d') AS (d agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create ASSIGNED_TO edge for resources', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (r:resource {name: \"Rescue Boat\"}), (m:mission {id: 1}) CREATE (r)-[a:assigned_to {quantity: 1}]->(m) RETURN a') AS (a agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T03 - Causal and Temporal Relationships', () => {
    test('I01: should create CAUSED_BY edge for cascading disasters', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (flood:incident {type: \"BANJIR\"}), (rain:incident {type: \"HUJAN\"}) CREATE (flood)-[c:caused_by {probability: 0.85}]->(rain) RETURN c') AS (c agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should create AFFECTS edge with impact severity', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident {id: 1}), (l:location {name: \"Jakarta\"}) CREATE (i)-[a:affects {impact_severity: \"HIGH\"}]->(l) RETURN a') AS (a agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create RELATED_TO edge between intel and incident', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (ir:intel_report {id: 1}), (i:incident {id: 1}) CREATE (ir)-[r:related_to {relevance: 0.9}]->(i) RETURN r') AS (r agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T04 - Relationship Tests', () => {
    test('I01: should verify edge creation returns valid edge', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH ()-[r:manages]->() RETURN r LIMIT 1') AS (r agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should traverse from Incident via AFFECTS to Location', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident)-[a:affects]->(l:location) RETURN i, a, l') AS (i agtype, a agtype, l agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should query MANAGES hierarchy with depth', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (supervisor:person)-[m:manages]->(subordinate:person) RETURN supervisor, m, subordinate') AS (supervisor agtype, m agtype, subordinate agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I04: should count all edges in graph', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH ()-[r]->() RETURN count(r) as count') AS (count agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });
});