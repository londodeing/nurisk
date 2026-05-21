/**
 * Sync Migration
 * ============
 * Database migration for sync tables
 */

const pool = require('../config/database');

async function up() {
  console.log('[MIGRATION] Running sync migration...');

  // Create sync_changelog table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_changelog (
      id SERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(100) NOT NULL,
      operation VARCHAR(20) NOT NULL,
      data JSONB DEFAULT '{}',
      client_version INTEGER,
      server_version INTEGER,
      client_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created sync_changelog table');

  // Add sync_version column to main tables
  const tables = [
    'incidents',
    'missions',
    'assets',
    'messages',
    'volunteers',
    'shelters',
    'notifications',
  ];

  for (const table of tables) {
    try {
      await pool.query(`
        ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 0
      `);
      console.log(`[MIGRATION] Added sync_version to ${table}`);
    } catch (err) {
      // Column might already exist
    }
  }

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sync_changelog_entity 
    ON sync_changelog(entity_type, entity_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sync_changelog_client 
    ON sync_changelog(client_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sync_changelog_created 
    ON sync_changelog(created_at)
  `);

  // Add indexes to main tables
  for (const table of tables) {
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_${table}_sync_version 
        ON ${table}(sync_version)
      `);
    } catch (err) {
      // Index might already exist
    }
  }

  console.log('[MIGRATION] Created sync indexes');

  // Create sync_conflicts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_conflicts (
      id SERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(100) NOT NULL,
      client_version INTEGER,
      server_version INTEGER,
      client_data JSONB DEFAULT '{}',
      server_data JSONB DEFAULT '{}',
      resolution_strategy VARCHAR(20) DEFAULT 'AUTHORITATIVE',
      resolved_data JSONB,
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created sync_conflicts table');

  // Create indexes for conflicts
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity 
    ON sync_conflicts(entity_type, entity_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolved 
    ON sync_conflicts(resolved_at)
  `);

  // Add synced column to sync_changelog
  await pool.query(`
    ALTER TABLE sync_changelog ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT false
  `);

  // Create edge_sync_log table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS edge_sync_log (
      id SERIAL PRIMARY KEY,
      node_id VARCHAR(100) NOT NULL,
      pulled INTEGER DEFAULT 0,
      pushed INTEGER DEFAULT 0,
      errors JSONB DEFAULT '[]',
      pulled_at TIMESTAMP WITH TIME ZONE,
      pushed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created edge_sync_log table');

  // Create local tables for edge
  await pool.query(`
    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      volunteer_id VARCHAR(100) NOT NULL,
      location JSONB,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      synced BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created checkins table');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      location JSONB,
      severity VARCHAR(20) DEFAULT 'medium',
      data JSONB DEFAULT '{}',
      synced BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log('[MIGRATION] Created reports table');

  console.log('[MIGRATION] Sync migration complete');
}

async function down() {
  console.log('[MIGRATION] Rolling back sync migration...');

  // Drop indexes
  await pool.query('DROP INDEX IF EXISTS idx_sync_changelog_entity');
  await pool.query('DROP INDEX IF EXISTS idx_sync_changelog_client');
  await pool.query('DROP INDEX IF EXISTS idx_sync_changelog_created');

  // Drop sync_version columns
  const tables = [
    'incidents',
    'missions',
    'assets',
    'messages',
    'volunteers',
    'shelters',
    'notifications',
  ];

  for (const table of tables) {
    try {
      await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS sync_version`);
    } catch (err) {
      // Column might not exist
    }
  }

  await pool.query('DROP TABLE IF EXISTS sync_changelog CASCADE');

  console.log('[MIGRATION] Sync migration rolled back');
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