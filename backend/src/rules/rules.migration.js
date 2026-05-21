/**
 * Rules Database Migration
 * ======================
 * Creates tables for rule orchestration
 */

const pool = require('../config/database');

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Rule sets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rule_sets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        match_behavior VARCHAR(10) DEFAULT 'ALL',
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rule definitions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rule_definitions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        rule_set_id INTEGER REFERENCES rule_sets(id) ON DELETE SET NULL,
        condition JSONB NOT NULL,
        actions JSONB DEFAULT '[]',
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rule evaluation logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rule_evaluation_logs (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER REFERENCES rule_definitions(id) ON DELETE SET NULL,
        rule_set_id INTEGER REFERENCES rule_sets(id) ON DELETE SET NULL,
        context JSONB,
        matched BOOLEAN,
        evaluation_time_ms INTEGER,
        executed_actions JSONB DEFAULT '[]',
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Playbook executions table (for trigger_playbook action)
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbook_executions (
        id SERIAL PRIMARY KEY,
        playbook_id INTEGER REFERENCES playbooks(id) ON DELETE SET NULL,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending',
        triggered_by INTEGER,
        executed_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rule_definitions_rule_set_id ON rule_definitions(rule_set_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rule_definitions_priority ON rule_definitions(priority DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rule_evaluation_logs_created_at ON rule_evaluation_logs(created_at)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] Rules tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION] Rules tables error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrate };