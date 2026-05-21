/**
 * Playbook Database Migration
 * ===========================
 * Creates tables for playbook and template storage
 */

const pool = require('../config/database');

async function migrate() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Playbooks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbooks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        disaster_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'DRAFT',
        version INTEGER DEFAULT 1,
        created_by INTEGER,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Playbook steps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbook_steps (
        id SERIAL PRIMARY KEY,
        playbook_id INTEGER REFERENCES playbooks(id) ON DELETE CASCADE,
        step_order INTEGER NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        config JSONB DEFAULT '{}',
        timeout_seconds INTEGER DEFAULT 300,
        retry_count INTEGER DEFAULT 0,
        on_failure VARCHAR(50) DEFAULT 'STOP'
      )
    `);

    // Playbook triggers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbook_triggers (
        id SERIAL PRIMARY KEY,
        playbook_id INTEGER REFERENCES playbooks(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        condition_expression TEXT DEFAULT '',
        cooldown_minutes INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Playbook templates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playbook_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        disaster_type VARCHAR(100) NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        steps JSONB NOT NULL,
        variables JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbooks_disaster_type ON playbooks(disaster_type)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbooks_status ON playbooks(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbook_steps_playbook_id ON playbook_steps(playbook_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_playbook_triggers_playbook_id ON playbook_triggers(playbook_id)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] Playbook tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION] Playbook tables error:', error.message);
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