-- F01 Database Migration - Sequence Reset
-- Task: T02 - Create Migration Scripts
-- Date: 2026-05-14

-- Get current sequence values and verify
SELECT 'incidents_id_seq' as sequence_name, last_value FROM incidents_id_seq
UNION ALL
SELECT 'intel_news_id_seq', last_value FROM intel_news_id_seq
UNION ALL
SELECT 'historical_disasters_id_seq', last_value FROM historical_disasters_id_seq
UNION ALL
SELECT 'users_id_seq', last_value FROM users_id_seq
UNION ALL
SELECT 'volunteers_id_seq', last_value FROM volunteers_id_seq
UNION ALL
SELECT 'organizations_id_seq', last_value FROM organizations_id_seq;

-- Ensure sequences are set to max + 1 (preserve IDs)
SELECT setval('incidents_id_seq', COALESCE((SELECT MAX(id) + 1 FROM incidents), 1));
SELECT setval('intel_news_id_seq', COALESCE((SELECT MAX(id) + 1 FROM intel_news), 1));
SELECT setval('historical_disasters_id_seq', COALESCE((SELECT MAX(id) + 1 FROM historical_disasters), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) + 1 FROM users), 1));
SELECT setval('volunteers_id_seq', COALESCE((SELECT MAX(id) + 1 FROM volunteers), 1));
SELECT setval('organizations_id_seq', COALESCE((SELECT MAX(id) + 1 FROM organizations), 1));

-- Log sequence reset
INSERT INTO backup_pre_migration.migration_log (step_name, status) 
VALUES ('03-sequence-reset', 'COMPLETED');

SELECT 'Sequence reset completed' as status;