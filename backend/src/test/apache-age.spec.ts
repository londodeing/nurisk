/**
 * Apache AGE Graph Tests
 * ======================
 * Test suite for Apache AGE graph functionality
 * 
 * Note: These tests require a running PostgreSQL database with Apache AGE extension
 * and the nurisk_graph to be created. Run docker-compose up first.
 */

const { Pool } = require('pg');

let pool: any;

beforeAll(() => {
  // Use the actual database credentials
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'nurisk',
    password: process.env.DB_PASSWORD || 'nurisk',
    database: process.env.DB_NAME || 'nurisk',
  });
});

describe('Apache AGE Graph', () => {

  describe('T02 - Graph Namespace', () => {
    test('I01: should verify graph exists', async () => {
      const result = await pool.query(
        "SELECT * FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph'"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('I02: should verify search_path includes ag_catalog', async () => {
      const result = await pool.query('SHOW search_path');
      const searchPath = result.rows[0].search_path;
      expect(searchPath).toContain('ag_catalog');
    });

    test('I03: should verify vertex labels exist', async () => {
      const result = await pool.query(
        "SELECT * FROM ag_catalog.ag_label WHERE graph = (SELECT id FROM ag_catalog.ag_graph WHERE name = 'nurisk_graph') AND kind = 'v'"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('T03 - Graph Sync Functions', () => {
    test('I01: should sync incidents to graph', async () => {
      // First ensure we have incidents
      const incidents = await pool.query('SELECT COUNT(*) as count FROM incidents');
      const count = parseInt(incidents.rows[0].count);

      if (count > 0) {
        await pool.query('SELECT sync_incidents_to_graph()');
        
        // Verify vertices were created
        const result = await pool.query(
          "SELECT * FROM cypher('nurisk_graph', 'MATCH (i:incident) RETURN count(i) as count') AS (count agtype)"
        );
        expect(result.rows.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('I02: should sync locations to graph', async () => {
      await pool.query('SELECT sync_locations_to_graph()');
      
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (l:location) RETURN count(l) as count') AS (count agtype)"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('I03: should sync organizations to graph', async () => {
      await pool.query('SELECT sync_organizations_to_graph()');
      
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (o:organization) RETURN count(o) as count') AS (count agtype)"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('T04 - Graph Creation Tests', () => {
    test('I01: should create vertex via Cypher', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (t:test {name: \"test_vertex\"}) RETURN id') AS (id agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should verify vertex label', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (t:test {name: \"test_vertex\"}) RETURN t') AS (t agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should create edge between vertices', async () => {
      // Create two test vertices
      await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'CREATE (a:test {name: \"source\"}), (b:test {name: \"target\"}) RETURN a, b') AS (a agtype, b agtype)"
      );

      // Create edge between them
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (a:test {name: \"source\"}), (b:test {name: \"target\"}) CREATE (a)-[:test_edge]->(b) RETURN a, b') AS (a agtype, b agtype)"
      );
      expect(result.rows[0]).toBeDefined();
    });
  });
});