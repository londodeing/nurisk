/**
 * Escalation Migration
 * ==================
 * Database migration for escalation tables
 */

const pool = require('../config/database');

async function up() {
  console.log('[MIGRATION] Running escalation migration...');

  // Create escalation_timers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS escalation_timers (
      id SERIAL PRIMARY KEY,
      step_execution_id INTEGER NOT NULL,
      execution_id INTEGER NOT NULL,
      timeout_ms INTEGER NOT NULL,
      fire_at TIMESTAMP WITH TIME ZONE NOT NULL,
      escalation_action JSONB NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created escalation_timers table');

  // Create escalation_logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS escalation_logs (
      id SERIAL PRIMARY KEY,
      execution_id INTEGER NOT NULL,
      step_execution_id INTEGER,
      level VARCHAR(50) NOT NULL,
      target VARCHAR(50) NOT NULL,
      action VARCHAR(50) NOT NULL,
      details JSONB DEFAULT '{}',
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMP WITH TIME ZONE,
      resolved_by INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created escalation_logs table');

  // Create escalation_rules table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS escalation_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(1000) DEFAULT '',
      trigger_type VARCHAR(50) NOT NULL,
      condition JSONB,
      action VARCHAR(50) NOT NULL,
      target VARCHAR(50) NOT NULL,
      config JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT TRUE,
      priority INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created escalation_rules table');

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_escalation_timers_execution 
    ON escalation_timers(execution_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_escalation_timers_status 
    ON escalation_timers(status)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_escalation_logs_execution 
    ON escalation_logs(execution_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_escalation_rules_trigger 
    ON escalation_rules(trigger_type)
  `);

  console.log('[MIGRATION] Created escalation indexes');
  console.log('[MIGRATION] Escalation migration complete');
}

async function down() {
  console.log('[MIGRATION] Rolling back escalation migration...');

  await pool.query('DROP TABLE IF EXISTS escalation_timers CASCADE');
  await pool.query('DROP TABLE IF EXISTS escalation_logs CASCADE');
  await pool.query('DROP TABLE IF EXISTS escalation_rules CASCADE');

  console.log('[MIGRATION] Escalation migration rolled back');
}

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      await up();
      process.exit(0);
    } catch (error) {
      console.error('[MIGRATION] Error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };