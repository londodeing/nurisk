import 'dotenv/config';
import pool from '../src/config/database';

interface BenchmarkResult {
  method: string;
  p50: number;
  p95: number;
  totalTime: number;
  ops: number;
}

async function benchmarkQuery(
  name: string,
  fn: () => Promise<any>,
  iterations = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(iterations * 0.5)];
  const p95 = times[Math.floor(iterations * 0.95)];
  const totalTime = times.reduce((a, b) => a + b, 0);

  return {
    method: name,
    p50: Math.round(p50 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
    ops: iterations,
  };
}

async function getPoolStats() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        count(*)::int as total_connections,
        count(*) filter (where state = 'active')::int as active_connections,
        count(*) filter (where state = 'idle')::int as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function runBenchmarks() {
  console.log('\n🧪 Benchmark: SQL Query Performance\n');
  console.log('='.repeat(50));

  // Test 1: Simple select
  console.log('\n📊 Test 1: Simple SELECT (100 iterations)\n');

  const simpleQuery = await benchmarkQuery('SELECT * FROM incidents LIMIT 10', async () => {
    const result = await pool.query('SELECT * FROM incidents LIMIT 10');
    return result.rows;
  });

  // Test 2: Filtered query
  console.log('\n📊 Test 2: WHERE clause (100 iterations)\n');

  const filteredQuery = await benchmarkQuery('SELECT with WHERE status = $1', async () => {
    const result = await pool.query(
      'SELECT * FROM incidents WHERE status = $1 LIMIT 10',
      ['REPORTED']
    );
    return result.rows;
  });

  // Test 3: Join query
  console.log('\n📊 Test 3: JOIN query (100 iterations)\n');

  const joinQuery = await benchmarkQuery('SELECT with JOIN', async () => {
    const result = await pool.query(`
      SELECT i.*, ins.id as ins_id, ins.content as ins_content
      FROM incidents i
      LEFT JOIN instructions ins ON ins.incident_id = i.id
      LIMIT 10
    `);
    return result.rows;
  });

  // Test 4: Count
  console.log('\n📊 Test 4: COUNT query (100 iterations)\n');

  const countQuery = await benchmarkQuery('SELECT COUNT(*)', async () => {
    const result = await pool.query('SELECT COUNT(*) FROM incidents');
    return result.rows;
  });

  // Test 5: Aggregate
  console.log('\n📊 Test 5: GROUP BY aggregate (100 iterations)\n');

  const aggregateQuery = await benchmarkQuery('SELECT with GROUP BY', async () => {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM incidents 
      GROUP BY status
    `);
    return result.rows;
  });

  // Print results
  console.log('\n📈 RESULTS\n');
  console.log('-'.repeat(70));
  console.log('Method'.padEnd(35), 'P50 (ms)'.padEnd(12), 'P95 (ms)'.padEnd(12), 'Total (ms)');
  console.log('-'.repeat(70));

  const allResults = [simpleQuery, filteredQuery, joinQuery, countQuery, aggregateQuery];
  for (const r of allResults) {
    console.log(r.method.padEnd(35), String(r.p50).padEnd(12), String(r.p95).padEnd(12), r.totalTime);
  }

  // Summary
  console.log('\n📋 SUMMARY\n');
  const avgP50 = (simpleQuery.p50 + filteredQuery.p50 + joinQuery.p50 + countQuery.p50 + aggregateQuery.p50) / 5;
  console.log(`  Average P50: ${avgP50.toFixed(2)}ms`);
  console.log(`  Fastest: ${Math.min(simpleQuery.p50, filteredQuery.p50, countQuery.p50).toFixed(2)}ms`);
  console.log(`  Slowest: ${Math.max(joinQuery.p50, aggregateQuery.p50).toFixed(2)}ms`);

  // Pool stats
  const poolStats = await getPoolStats();
  console.log('\n🔌 CONNECTION POOL\n');
  console.log(`  Total: ${poolStats.total_connections}`);
  console.log(`  Active: ${poolStats.active_connections}`);
  console.log(`  Idle: ${poolStats.idle_connections}`);

  await pool.end();
}

runBenchmarks().catch(console.error);