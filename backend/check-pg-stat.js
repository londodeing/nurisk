require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pusdatin_nu',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
});

// Enable pg_stat_statements extension
async function enablePgStatStatements() {
  try {
    const client = await pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
      console.log('✅ pg_stat_statements extension enabled');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Error enabling pg_stat_statements:', err.message);
  }
}

// Run EXPLAIN ANALYZE on top 20 queries (we'll use some common queries from the application)
async function runExplainAnalyze() {
  try {
    const client = await pool.connect();
    try {
      // Common queries we might want to analyze
      const queries = [
        { text: 'SELECT * FROM incidents LIMIT 10', values: [] },
        { text: 'SELECT * FROM users WHERE username = $1', values: ['testuser'] },
        { text: 'SELECT * FROM historical_disasters LIMIT 10', values: [] },
        { text: 'SELECT * FROM volunteers WHERE user_id = $1', values: [1] },
        { text: 'SELECT * FROM building_assessments LIMIT 10', values: [] },
        { text: 'SELECT * FROM audit_logs LIMIT 10', values: [] },
        { text: 'SELECT status, COUNT(*) FROM incidents GROUP BY status', values: [] },
        { text: 'SELECT severity, COUNT(*) FROM incidents GROUP BY severity', values: [] },
        { text: 'SELECT * FROM incidents WHERE status = $1 ORDER BY created_at DESC LIMIT 10', values: ['active'] },
        { text: "SELECT * FROM incidents WHERE created_at >= NOW() - INTERVAL '30 days' LIMIT 10", values: [] }
      ];

      console.log('\\n🔍 Running EXPLAIN ANALYZE on sample queries:');
      for (const [index, { text, values }] of queries.entries()) {
        try {
          const explainQuery = `EXPLAIN ANALYZE ${text}`;
          const result = await client.query(explainQuery, values);
          console.log(`\\nQuery ${index + 1}: ${text}`);
          console.log('EXPLAIN ANALYZE results:');
          result.rows.forEach(row => {
            console.log(row['QUERY PLAN']);
          });
        } catch (queryErr) {
          console.error(`\\n❌ Error executing query ${index + 1}:`, queryErr.message);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Error running EXPLAIN ANALYZE:', err.message);
  }
}

// Identify sequential scans on large tables via pg_stat_user_tables
async function checkSequentialScans() {
  try {
    const client = await pool.connect();
    try {
      // First, let's check what columns are available
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pg_stat_user_tables'
        ORDER BY ordinal_position;
      `);
      
      console.log('\\n📋 Columns in pg_stat_user_tables:');
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}`);
      });
      
      const result = await client.query(`
        SELECT 
          schemaname,
          relname,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          n_tup_ins,
          n_tup_upd,
          n_tup_del,
          n_live_tup,
          n_dead_tup
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY seq_tup_read DESC
        LIMIT 10;
      `);
      
      console.log('\\n📊 Sequential scan statistics (top 10 tables by rows read via sequential scan):');
      console.log('Table Name | Seq Scan | Seq Tuples Read | Index Scan | Index Tuples Fetch');
      console.log('------------------------------------------------------------------');
      result.rows.forEach(row => {
        console.log(`${row.relname} | ${row.seq_scan} | ${row.seq_tup_read} | ${row.idx_scan} | ${row.idx_tup_fetch}`);
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Error checking sequential scans:', err.message);
  }
}

// Main function
async function main() {
  await enablePgStatStatements();
  await runExplainAnalyze();
  await checkSequentialScans();
  await pool.end();
}

main();