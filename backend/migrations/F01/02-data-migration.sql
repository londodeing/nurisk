-- F01 Database Migration - Data Migration
-- Task: T02 - Create Migration Scripts
-- Date: 2026-05-14

BEGIN;

-- Validate row counts before migration
DO $$
DECLARE
    v_users_count INTEGER;
    v_incidents_count INTEGER;
    v_intel_news_count INTEGER;
    v_historical_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users_count FROM users;
    SELECT COUNT(*) INTO v_incidents_count FROM incidents;
    SELECT COUNT(*) INTO v_intel_news_count FROM intel_news;
    SELECT COUNT(*) INTO v_historical_count FROM historical_disasters;
    
    RAISE NOTICE 'Pre-migration counts: users=%, incidents=%, intel_news=%, historical=%', 
        v_users_count, v_incidents_count, v_intel_news_count, v_historical_count;
END $$;

-- Validate coordinate bounds for Central Java incidents
DO $$
DECLARE
    v_out_of_bounds INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_out_of_bounds FROM incidents 
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    AND (
        latitude NOT BETWEEN -8.8 AND -5.4 
        OR longitude NOT BETWEEN 108.3 AND 111.9
    );
    
    IF v_out_of_bounds > 0 THEN
        RAISE WARNING 'Found % incidents outside Central Java bounds', v_out_of_bounds;
    END IF;
END $$;

-- Validate FK integrity
DO $$
DECLARE
    v_orphaned_volunteers INTEGER;
    v_orphaned_messages INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_orphaned_volunteers 
    FROM volunteers v 
    LEFT JOIN users u ON v.user_id = u.id 
    WHERE u.id IS NULL;
    
    IF v_orphaned_volunteers > 0 THEN
        RAISE WARNING 'Found % orphaned volunteer records', v_orphaned_volunteers;
    END IF;
END $$;

-- Log data validation
INSERT INTO backup_pre_migration.migration_log (step_name, status) 
VALUES ('02-data-migration', 'COMPLETED');

COMMIT;

SELECT 'Data migration validation completed' as status;