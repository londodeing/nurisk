import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pool from '../src/config/database';

// Use Prisma client from apps/backend
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

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
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function runBenchmarks() {
  console.log('\n🧪 Benchmark: Prisma vs Raw SQL\n');
  console.log('='.repeat(50));

  // Test 1: Simple select
  console.log('\n📊 Test 1: Simple SELECT (100 iterations)\n');

  const prismaSimple = await benchmarkQuery('Prisma - findMany', async () => {
    await prisma.incident.findMany({ take: 10 });
  });

  const rawSimple = await benchmarkQuery('Raw SQL - pool.query', async () => {
    const result = await pool.query('SELECT * FROM incidents LIMIT 10');
    return result.rows;
  });

  // Test 2: Filtered query
  console.log('\n📊 Test 2: WHERE clause (100 iterations)\n');

  const prismaFiltered = await benchmarkQuery('Prisma - where', async () => {
    await prisma.incident.findMany({
      where: { status: 'REPORTED' },
      take: 10,
    });
  });

  const rawFiltered = await benchmarkQuery('Raw SQL - WHERE', async () => {
    const result = await pool.query(
      'SELECT * FROM incidents WHERE status = $1 LIMIT 10',
      ['REPORTED']
    );
    return result.rows;
  });

  // Test 3: Join query
  console.log('\n📊 Test 3: JOIN query (100 iterations)\n');

  const prismaJoin = await benchmarkQuery('Prisma - include', async () => {
    await prisma.incident.findMany({
      include: { instructions: true },
      take: 10,
    });
  });

  const rawJoin = await benchmarkQuery('Raw SQL - JOIN', async () => {
    const result = await pool.query(`
      SELECT i.*, ins.id as ins_id, ins.content as ins_content
      FROM incidents i
      LEFT JOIN instructions ins ON ins.incident_id = i.id
      LIMIT 10
    `);
    return result.rows;
  });

  // Test 4: Insert
  console.log('\n📊 Test 4: INSERT (100 iterations)\n');

  const prismaInsert = await benchmarkQuery('Prisma - create', async () => {
    await prisma.incident.create({
      data: {
        incidentCode: `BENCH-${Date.now()}`,
        disasterType: 'BENCHMARK',
        priorityLevel: 'LOW',
        description: 'Benchmark test',
        location: JSON.stringify({ lat: -6.2, lng: 110.4 }),
      },
    });
  });

  const rawInsert = await benchmarkQuery('Raw SQL - INSERT', async () => {
    await pool.query(
      `INSERT INTO incidents (incident_code, disaster_type, priority_level, description, location)
       VALUES ($1, $2, $3, $4, $5)`,
      [`BENCH-${Date.now()}`, 'BENCHMARK', 'LOW', 'Benchmark test', JSON.stringify({ lat: -6.2, lng: 110.4 })]
    );
  });

  // Print results
  console.log('\n📈 RESULTS\n');
  console.log('-'.repeat(70));
  console.log('Method'.padEnd(25), 'P50 (ms)'.padEnd(12), 'P95 (ms)'.padEnd(12), 'Total (ms)');
  console.log('-'.repeat(70));

  const allResults = [prismaSimple, rawSimple, prismaFiltered, rawFiltered, prismaJoin, rawJoin, prismaInsert, rawInsert];
  for (const r of allResults) {
    console.log(r.method.padEnd(25), String(r.p50).padEnd(12), String(r.p95).padEnd(12), r.totalTime);
  }

  // Summary
  console.log('\n📋 SUMMARY\n');
  const prismaAvg = (prismaSimple.p50 + prismaFiltered.p50 + prismaJoin.p50 + prismaInsert.p50) / 4;
  const rawAvg = (rawSimple.p50 + rawFiltered.p50 + rawJoin.p50 + rawInsert.p50) / 4;
  const speedup = ((prismaAvg - rawAvg) / rawAvg * 100).toFixed(1);

  console.log(`  Prisma avg P50: ${prismaAvg.toFixed(2)}ms`);
  console.log(`  Raw SQL avg P50: ${rawAvg.toFixed(2)}ms`);
  console.log(`  Speed difference: ${speedup}% ${parseFloat(speedup) > 0 ? 'faster (raw)' : 'faster (prisma)'}`);

  // Pool stats
  const poolStats = await getPoolStats();
  console.log('\n🔌 CONNECTION POOL\n');
  console.log(`  Total: ${poolStats.total_connections}`);
  console.log(`  Active: ${poolStats.active_connections}`);
  console.log(`  Idle: ${poolStats.idle_connections}`);

  await prisma.$disconnect();
  await pool.end();
}

runBenchmarks().catch(console.error);