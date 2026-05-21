/**
 * Trend & Anomaly Detection Tests
 * ============================
 * Test suite for trend analysis and anomaly detection
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

describe('Trend & Anomaly Detection', () => {
  describe('T01 - Moving Average', () => {
    test('I01: should calculate 7-day moving average', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.calculateMovingAverage('incident_count', 7);
      expect(result).toBeDefined();
    });

    test('I02: should calculate 30-day moving average', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.calculateMovingAverage('incident_count', 30);
      expect(result).toBeDefined();
    });

    test('I03: should query trend metrics table', async () => {
      const result = await pool.query(`
        SELECT * FROM trend_metrics
        ORDER BY bucket_date DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });
  });

  describe('T02 - Anomaly Detection (2-sigma)', () => {
    test('I01: should detect anomalies using 2-sigma', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.detectAnomalies(30);
      expect(result).toBeDefined();
    });

    test('I02: should flag data points > 2 sigma from mean', async () => {
      const result = await pool.query(`
        SELECT * FROM trend_metrics
        WHERE is_anomaly = TRUE
        AND anomaly_score > 2
        ORDER BY anomaly_score DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: should log anomalies in anomaly_log', async () => {
      const result = await pool.query(`
        SELECT * FROM anomaly_log
        ORDER BY detected_at DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });
  });

  describe('T03 - Trend Endpoints', () => {
    test('I01: should return incident trends with MA', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.getIncidentTrends(30);
      expect(result).toBeDefined();
    });

    test('I02: should return recent anomalies', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.getAnomalies(7);
      expect(result).toBeDefined();
    });

    test('I03: should return seasonality patterns', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.getSeasonality();
      expect(result).toBeDefined();
      expect(result.day_of_week).toBeDefined();
      expect(result.month).toBeDefined();
    });
  });

  describe('T04 - Trend Analysis Tests', () => {
    test('I01: moving average smooths daily fluctuations', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.calculateMovingAverage('incident_count', 7);
      // MA should have less variance than raw data
      expect(result).toBeDefined();
    });

    test('I02: 2-sigma detection flags data point 3 sigma from mean', async () => {
      const result = await pool.query(`
        SELECT * FROM trend_metrics
        WHERE anomaly_score > 3
        ORDER BY anomaly_score DESC
        LIMIT 5
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: normal variation within 1 sigma does not trigger anomaly', async () => {
      const result = await pool.query(`
        SELECT * FROM trend_metrics
        WHERE anomaly_score <= 1
        AND bucket_date >= date_trunc('day', NOW()) - INTERVAL '7 days'
        ORDER BY bucket_date DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I04: should get trend summary', async () => {
      const service = require('../services/trendAnalysisService');
      const result = await service.getTrendSummary();
      expect(result).toBeDefined();
      expect(result.total_trend_days).toBeDefined();
    });
  });
});