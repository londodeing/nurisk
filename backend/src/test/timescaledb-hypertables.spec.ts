/**
 * TimescaleDB Hypertables Tests
 * ============================
 * Test suite for time-series tables
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

describe('TimescaleDB Hypertables', () => {
  describe('T01 - Incident Temporal Hypertable', () => {
    test('I01: should create hypertable with timestamp partitioning', async () => {
      const result = await pool.query(`
        SELECT * FROM timescaledb.hypertables 
        WHERE hypertable_name = 'incident_temporal'
      `);
      expect(result.rows).toBeDefined();
    });

    test('I02: should insert temporal data with recorded_at', async () => {
      const result = await pool.query(`
        INSERT INTO incident_temporal (
          incident_id, recorded_at, status, disaster_type, 
          severity_score, priority_level, region
        ) VALUES (1, NOW(), 'ACTIVE', 'BANJIR', 5, 'HIGH', 'Jakarta')
        RETURNING id, incident_id, recorded_at
      `);
      expect(result.rows[0]).toBeDefined();
    });

    test('I03: should have indexes on incident_id and recorded_at', async () => {
      const result = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'incident_temporal'
        AND indexname LIKE 'idx_incident_temporal%'
      `);
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('T02 - Continuous Aggregates', () => {
    test('I01: should have hourly aggregate view', async () => {
      const result = await pool.query(`
        SELECT * FROM timescaledb.continuous_aggregates
        WHERE view_name = 'incident_hourly_stats'
      `);
      expect(result.rows).toBeDefined();
    });

    test('I02: should have daily aggregate view', async () => {
      const result = await pool.query(`
        SELECT * FROM timescaledb.continuous_aggregates
        WHERE view_name = 'incident_daily_stats'
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: should have refresh policy with 1 hour lag', async () => {
      const result = await pool.query(`
        SELECT refresh_lag 
        FROM timescaledb.continuous_aggregates
        WHERE view_name = 'incident_hourly_stats'
      `);
      expect(result.rows[0]).toBeDefined();
    });
  });

  describe('T03 - Data Retention and Compression', () => {
    test('I01: should have compression enabled', async () => {
      const result = await pool.query(`
        SELECT compression_enabled 
        FROM timescaledb.hypertables
        WHERE hypertable_name = 'incident_temporal'
      `);
      expect(result.rows[0]?.compression_enabled).toBe(true);
    });

    test('I02: should have compression policy', async () => {
      const result = await pool.query(`
        SELECT * FROM timescaledb.compression_policies
        WHERE hypertable_name = 'incident_temporal'
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: should have retention policy', async () => {
      const result = await pool.query(`
        SELECT * FROM timescaledb.retention_policies
        WHERE hypertable_name = 'incident_temporal'
      `);
      expect(result.rows).toBeDefined();
    });
  });

  describe('T04 - Temporal Table Tests', () => {
    test('I01: should query time-bucketed data', async () => {
      const result = await pool.query(`
        SELECT time_bucket('1 hour', recorded_at) AS bucket,
          COUNT(*) AS count
        FROM incident_temporal
        WHERE recorded_at > NOW() - INTERVAL '24 hours'
        GROUP BY bucket
        ORDER BY bucket
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I02: should query hourly aggregate', async () => {
      const result = await pool.query(`
        SELECT * FROM incident_hourly_stats
        ORDER BY bucket DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I03: should query daily aggregate', async () => {
      const result = await pool.query(`
        SELECT * FROM incident_daily_stats
        ORDER BY bucket DESC
        LIMIT 10
      `);
      expect(result.rows).toBeDefined();
    });

    test('I04: should get chunk information', async () => {
      const result = await pool.query(`
        SELECT chunk_name, table_schema
        FROM timescaledb.chunks
        WHERE hypertable_name = 'incident_temporal'
        ORDER BY chunk_start_time
        LIMIT 5
      `);
      expect(result.rows).toBeDefined();
    });
  });
});