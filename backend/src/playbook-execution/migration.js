/**
 * Playbook Execution Migration
 * =========================
 * Creates tables for playbook execution tracking
 */

const pool = require('../config/database');

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Playbook executions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbook_executions (
        id SERIAL PRIMARY KEY,
        playbook_id INTEGER REFERENCES playbooks(id) ON DELETE SET NULL,
        incident_id INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        context JSONB DEFAULT '{}',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step executions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS step_executions (
        id SERIAL PRIMARY KEY,
        execution_id INTEGER REFERENCES playbook_executions(id) ON DELETE CASCADE,
        step_id INTEGER REFERENCES playbook_steps(id) ON DELETE SET NULL,
        step_order INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        output JSONB,
        error TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    // Add depends_on column to playbook_steps if not exists
    try {
      await client.query(`
        ALTER TABLE playbook_steps ADD COLUMN IF NOT EXISTS depends_on INTEGER[] DEFAULT '{}'
      `);
    } catch (e) {
      // Column may already exist
    }

    // Add run_parallel column to playbook_steps if not exists
    try {
      await client.query(`
        ALTER TABLE playbook_steps ADD COLUMN IF NOT EXISTS run_parallel BOOLEAN DEFAULT false
      `);
    } catch (e) {
      // Column may already exist
    }

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbook_executions_playbook_id ON playbook_executions(playbook_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbook_executions_incident_id ON playbook_executions(incident_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbook_executions_status ON playbook_executions(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_step_executions_execution_id ON step_executions(execution_id)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] Playbook execution tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION] Playbook execution tables error:', error.message);
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