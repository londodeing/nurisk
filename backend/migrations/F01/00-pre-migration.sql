-- F01 Database Migration - Pre-Migration Setup
-- Task: T02 - Create Migration Scripts
-- Date: 2026-05-14

-- Create backup schema with timestamp
DO $$
DECLARE
    backup_date TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
BEGIN
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS backup_' || backup_date;
END $$;

-- Backup critical tables
CREATE TABLE IF NOT EXISTS backup_pre_migration.users AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS backup_pre_migration.incidents AS SELECT * FROM incidents;
CREATE TABLE IF NOT EXISTS backup_pre_migration.volunteers AS SELECT * FROM volunteers;
CREATE TABLE IF NOT EXISTS backup_pre_migration.intel_news AS SELECT * FROM intel_news;
CREATE TABLE IF NOT EXISTS backup_pre_migration.historical_disasters AS SELECT * FROM historical_disasters;
CREATE TABLE IF NOT EXISTS backup_pre_migration.organizations AS SELECT * FROM organizations;
CREATE TABLE IF NOT EXISTS backup_pre_migration.incident_instructions AS SELECT * FROM incident_instructions;
CREATE TABLE IF NOT EXISTS backup_pre_migration.chat_messages AS SELECT * FROM chat_messages;
CREATE TABLE IF NOT EXISTS backup_pre_migration.chat_conversations AS SELECT * FROM chat_conversations;

-- Record current sequence values
CREATE TABLE IF NOT EXISTS backup_pre_migration.sequence_values AS
SELECT 
    sequence_name, 
    last_value 
FROM information_schema.sequences 
WHERE sequence_schema = 'public';

-- Log migration start
CREATE TABLE IF NOT EXISTS backup_pre_migration.migration_log (
    id SERIAL PRIMARY KEY,
    step_name TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status TEXT DEFAULT 'IN_PROGRESS',
    notes TEXT
);

INSERT INTO backup_pre_migration.migration_log (step_name, status) 
VALUES ('00-pre-migration', 'COMPLETED');

SELECT 'Pre-migration backup completed' as status;