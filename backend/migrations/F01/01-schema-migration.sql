-- F01 Database Migration - Schema Migration
-- Task: T02 - Create Migration Scripts
-- Date: 2026-05-14

BEGIN;

-- Disable triggers temporarily for faster migration
SET session_replication_role = replica;

-- Create new indexes for agent queries (if not exist)
-- Incidents indexes
CREATE INDEX IF NOT EXISTS idx_incidents_region_lower ON incidents(LOWER(region));
CREATE INDEX IF NOT EXISTS idx_incidents_type_lower ON incidents(LOWER(type));
CREATE INDEX IF NOT EXISTS idx_incidents_coordinates ON incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_updated_at ON incidents(updated_at);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Volunteers indexes
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_incident_id ON chat_conversations(incident_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Log schema migration
INSERT INTO backup_pre_migration.migration_log (step_name, status) 
VALUES ('01-schema-migration', 'COMPLETED');

COMMIT;

SELECT 'Schema migration completed' as status;