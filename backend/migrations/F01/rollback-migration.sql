-- F01 Database Migration - Rollback Script
-- Task: T02 - Create Migration Scripts
-- Date: 2026-05-14

BEGIN;

-- Drop any new tables if they exist
DROP TABLE IF EXISTS incidents_new CASCADE;
DROP TABLE IF EXISTS users_new CASCADE;

-- Restore from backup (if backup exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'backup_pre_migration') THEN
        -- Restore users from backup
        DELETE FROM users;
        INSERT INTO users SELECT * FROM backup_pre_migration.users;
        
        RAISE NOTICE 'Users restored from backup';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incidents' AND table_schema = 'backup_pre_migration') THEN
        -- Restore incidents from backup
        DELETE FROM incidents;
        INSERT INTO incidents SELECT * FROM backup_pre_migration.incidents;
        
        RAISE NOTICE 'Incidents restored from backup';
    END IF;
END $$;

-- Reset sequences to original values (from backup)
DO $$
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN SELECT sequence_name, last_value FROM backup_pre_migration.sequence_values LOOP
        EXECUTE 'SELECT setval(' || quote_literal(seq.sequence_name) || ', ' || seq.last_value || ')';
    END LOOP;
    
    RAISE NOTICE 'Sequences restored from backup';
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Log rollback
INSERT INTO backup_pre_migration.migration_log (step_name, status, notes) 
VALUES ('rollback', 'COMPLETED', 'Rollback executed successfully');

COMMIT;

SELECT 'Rollback completed' as status;