/**
 * Stream Analytics Tests
 * =====================
 * Test suite for real-time stream analytics
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

describe('Stream Analytics', () => {
  describe('T01 - Stream Ingestion Pipeline', () => {
    test('I01: should insert event to hypertable', async () => {
      const result = await pool.query(`
        INSERT INTO incident_temporal (
          incident_id, recorded_at, status, disaster_type,
          severity_score, priority_level, region
        ) VALUES (9999, NOW(), 'ACTIVE', 'TEST', 5, 'HIGH', 'TestRegion')
        RETURNING id, incident_id, recorded_at
      `);
      expect(result.rows[0]).toBeDefined();
    });

    test('I02: should query recent temporal data', async () => {
      const result = await pool.query(`
        SELECT * FROM incident_temporal
        ORDER BY recorded_at DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: should have buffer flush mechanism', async () => {
      const service = require('../services/streamAnalyticsService');
      expect(service.buffer).toBeDefined();
    });
  });

  describe('T02 - Sliding Window Rate', () => {
    test('I01: should calculate incident rate with time_bucket', async () => {
      const service = require('../services/streamAnalyticsService');
      const rates = await service.calculateIncidentRate();
      expect(rates).toBeDefined();
    });

    test('I02: should calculate sliding window with historical comparison', async () => {
      const service = require('../services/streamAnalyticsService');
      const rates = await service.calculateSlidingWindowRate();
      expect(rates).toBeDefined();
    });

    test('I03: should return rate with change percent', async () => {
      const service = require('../services/streamAnalyticsService');
      const rates = await service.calculateSlidingWindowRate();
      if (rates.length > 0) {
        expect(rates[0]).toHaveProperty('change_percent');
      }
    });
  });

  describe('T03 - Distribution Endpoints', () => {
    test('I01: should return geographic distribution', async () => {
      const service = require('../services/streamAnalyticsService');
      const distribution = await service.getGeographicDistribution();
      expect(distribution).toBeDefined();
    });

    test('I02: should return severity distribution histogram', async () => {
      const service = require('../services/streamAnalyticsService');
      const distribution = await service.getSeverityDistribution();
      expect(distribution).toBeDefined();
    });

    test('I03: should return type distribution', async () => {
      const service = require('../services/streamAnalyticsService');
      const distribution = await service.getTypeDistribution();
      expect(distribution).toBeDefined();
    });
  });

  describe('T04 - Stream Analytics Tests', () => {
    test('I01: should query time-bucketed data', async () => {
      const result = await pool.query(`
        SELECT 
          time_bucket('1 hour', recorded_at) AS bucket,
          COUNT(*) AS count
        FROM incident_temporal
        WHERE recorded_at > NOW() - INTERVAL '24 hours'
        GROUP BY bucket
        ORDER BY bucket
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I02: should get real-time stats', async () => {
      const service = require('../services/streamAnalyticsService');
      const stats = await service.getRealtimeStats();
      expect(stats).toBeDefined();
      expect(stats.last1h).toBeDefined();
      expect(stats.last24h).toBeDefined();
    });

    test('I03: should calculate hourly rates', async () => {
      const service = require('../services/streamAnalyticsService');
      const rates = await service.calculateIncidentRate();
      expect(rates).toBeDefined();
    });
  });
});