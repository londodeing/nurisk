/**
 * Local Database Schema
 * ==================
 * SQLite schema for offline caching
 */

// SQL statements for creating local tables
export const CREATE_TABLES_SQL = `
-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  type TEXT,
  status TEXT,
  priority INTEGER,
  title TEXT,
  description TEXT,
  location TEXT,
  region TEXT,
  reported_by TEXT,
  assigned_to TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  incident_id TEXT,
  sender_id TEXT,
  content TEXT,
  type TEXT,
  read_at INTEGER,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 604800,
  sync_version INTEGER DEFAULT 0);

-- Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  volunteer_id TEXT,
  incident_id TEXT,
  location TEXT,
  status TEXT,
  notes TEXT,
  checked_in_at INTEGER,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 1209600,
  sync_version INTEGER DEFAULT 0);

-- Shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT,
  capacity INTEGER,
  current_occupancy INTEGER,
  location TEXT,
  region TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  expertise TEXT,
  region TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  status TEXT,
  location TEXT,
  region TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0);

-- User profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT,
  region TEXT,
  data TEXT,
  cached_at INTEGER,
  ttl_seconds INTEGER DEFAULT 2592000,
  sync_version INTEGER DEFAULT 0);

-- Sync queue table
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  data TEXT,
  created_at INTEGER,
  synced INTEGER DEFAULT 0);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_cached_at ON incidents(cached_at);
CREATE INDEX IF NOT EXISTS idx_messages_cached_at ON messages(cached_at);
CREATE INDEX IF NOT EXISTS idx_checkins_cached_at ON checkins(cached_at);
CREATE INDEX IF NOT EXISTS idx_shelters_cached_at ON shelters(cached_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);
`;

// Retention policies in seconds
export const RETENTION_POLICY_SECONDS: Record<string, number> = {
  incident: 30 * 24 * 60 * 60, // 30 days
  message: 7 * 24 * 60 * 60, // 7 days
  checkin: 14 * 24 * 60 * 60, // 14 days
  shelter: 30 * 24 * 60 * 60, // 30 days
  volunteer: 30 * 24 * 60 * 60, // 30 days
  asset: 30 * 24 * 60 * 60, // 30 days
  region: 30 * 24 * 60 * 60, // 30 days
  user_profile: 30 * 24 * 60 * 60, // 30 days
};

// Entity types that can be cached
export const CACHEABLE_ENTITIES = [
  'incident',
  'message',
  'checkin',
  'shelter',
  'volunteer',
  'asset',
  'region',
  'user_profile',
];

// Export for CommonJS
export {};