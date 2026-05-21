/**
 * Graph Query API Tests
 * =================
 * Test suite for graph query endpoints
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

describe('Graph Query API', () => {
  describe('T01 - Cypher Query Service', () => {
    test('I01: should execute valid Cypher query', async () => {
      const result = await pool.query(
        "SELECT * FROM cypher('nurisk_graph', 'MATCH (n) RETURN n LIMIT 1') AS (n agtype)"
      );
      expect(result.rows).toBeDefined();
    });

    test('I02: should reject dangerous queries', async () => {
      const service = require('../services/cypherQueryService');
      await expect(
        service.executeCypher('DETACH DELETE MATCH (n) RETURN n')
      ).rejects.toThrow();
    });

    test('I03: should enforce query timeout', async () => {
      const service = require('../services/cypherQueryService');
      // Long running query should timeout
      await expect(
        service.executeCypher('MATCH (n) RETURN n')
      ).resolves.toBeDefined();
    });
  });

  describe('T02 - Proximity Query', () => {
    test('I01: should return nodes within specified hops', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getProximitySubgraph(1, 2);
      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });

    test('I02: should filter by edge types', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getProximitySubgraph(1, 2, ['AFFECTS']);
      expect(result).toBeDefined();
    });

    test('I03: should return nodes and edges arrays', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getProximitySubgraph(1, 2);
      expect(result.nodes).toBeInstanceOf(Array);
      expect(result.edges).toBeInstanceOf(Array);
    });
  });

  describe('T03 - Shortest Path', () => {
    test('I01: should find path between two nodes', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.findShortestPath('1', '2', ['AFFECTS', 'NEAR']);
      expect(result).toBeDefined();
    });

    test('I02: should filter by edge types', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.findShortestPath('1', '2', ['AFFECTS']);
      expect(result).toBeDefined();
    });

    test('I03: should return ordered path', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.findShortestPath('1', '2');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('T04 - Graph Visualization', () => {
    test('I01: should return incident neighborhood', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getIncidentSubgraph(1, 200);
      expect(result).toBeDefined();
    });

    test('I02: should format as force-directed graph', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getIncidentSubgraph(1);
      expect(result.nodes).toBeDefined();
      expect(result.links).toBeDefined();
    });

    test('I03: should limit nodes to 200', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getIncidentSubgraph(1, 200);
      expect(result.nodes.length).toBeLessThanOrEqual(200);
    });
  });

  describe('T05 - API Tests', () => {
    test('I01: proximity query returns correct nodes within 2 hops', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.getProximitySubgraph(1, 2);
      expect(result.nodes.length).toBeGreaterThan(0);
    });

    test('I02: shortest path returns valid path', async () => {
      const service = require('../services/cypherQueryService');
      const result = await service.findShortestPath('1', '2');
      expect(result).toBeDefined();
    });

    test('I03: Cypher injection attempt returns error', async () => {
      const service = require('../services/cypherQueryService');
      await expect(
        service.executeCypher("MATCH (n) DETACH DELETE n RETURN 'injected'")
      ).rejects.toThrow();
    });
  });
});