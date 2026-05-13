# T02 - Create Migration Scripts

**Task**: Create automated scripts to migrate database schema and data

**Input**: 
- Schema dependency analysis from T01
- nuriskanyar.sql dump file
- Current sequence values (incidents_id_seq=44, intel_news_id_seq=5140, etc.)

**Detailed Script Creation**:

1. **Pre-Migration Setup** (`00-pre-migration.sql`):
```sql
-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_$(date +%Y%m%d);

-- Backup critical tables
CREATE TABLE backup_$(date +%Y%m%d).users AS SELECT * FROM users;
CREATE TABLE backup_$(date +%Y%m%d).incidents AS SELECT * FROM incidents;
CREATE TABLE backup_$(date +%Y%m%d).volunteers AS SELECT * FROM volunteers;

-- Record current sequence values
CREATE TABLE backup_$(date +%Y%m%d).sequence_values AS
SELECT schemaname, sequencename, last_value FROM pg_sequences WHERE schemaname = 'public';
```

2. **Schema Migration** (`01-schema-migration.sql`):
```sql
-- Disable triggers temporarily
SET session_replication_role = replica;

-- Create new tables with enhanced structure for mainprd.md requirements
CREATE TABLE IF NOT EXISTS incidents_new (
    -- Preserve all existing columns from mainprd.md
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    disaster_type VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50) DEFAULT 'REPORTED',
    region VARCHAR(100) NOT NULL,
    affected_people INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    -- Add indexes for performance
    CONSTRAINT chk_coordinates CHECK (
        latitude BETWEEN -8.8 AND -5.4 AND 
        longitude BETWEEN 108.3 AND 111.9
    )
);

-- Create indexes immediately
CREATE INDEX CONCURRENTLY idx_incidents_region_lower ON incidents_new(LOWER(region));
CREATE INDEX CONCURRENTLY idx_incidents_type_lower ON incidents_new(LOWER(disaster_type));
CREATE INDEX CONCURRENTLY idx_incidents_coordinates ON incidents_new(latitude, longitude);
CREATE INDEX CONCURRENTLY idx_incidents_status ON incidents_new(status);
CREATE INDEX CONCURRENTLY idx_incidents_created_at ON incidents_new(created_at);
```

3. **Data Migration** (`02-data-migration.sql`):
```sql
-- Migrate in dependency order with validation
INSERT INTO incidents_new SELECT * FROM incidents 
WHERE latitude BETWEEN -8.8 AND -5.4 AND longitude BETWEEN 108.3 AND 111.9;

-- Validate row counts match
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM incidents;
    SELECT COUNT(*) INTO new_count FROM incidents_new;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Migration failed: row count mismatch. Old: %, New: %', old_count, new_count;
    END IF;
END $$;
```

4. **Sequence Reset** (`03-sequence-reset.sql`):
```sql
-- Restore sequence values from mainprd.md
SELECT setval('incidents_id_seq', GREATEST(44, (SELECT MAX(id) FROM incidents_new)));
SELECT setval('intel_news_id_seq', GREATEST(5140, (SELECT MAX(id) FROM intel_news)));
SELECT setval('historical_disasters_id_seq', GREATEST(12641, (SELECT MAX(id) FROM historical_disasters)));
SELECT setval('users_id_seq', GREATEST(27, (SELECT MAX(id) FROM users)));
SELECT setval('volunteers_id_seq', GREATEST(3, (SELECT MAX(id) FROM volunteers)));

-- Verify sequences are correct
SELECT 'incidents_id_seq' as sequence_name, last_value FROM incidents_id_seq
UNION ALL
SELECT 'intel_news_id_seq', last_value FROM intel_news_id_seq
UNION ALL
SELECT 'historical_disasters_id_seq', last_value FROM historical_disasters_id_seq;
```

5. **Rollback Script** (`rollback-migration.sql`):
```sql
-- Complete rollback procedure
BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS incidents_new CASCADE;

-- Restore from backup
INSERT INTO incidents SELECT * FROM backup_$(date +%Y%m%d).incidents;

-- Reset sequences to original values
SELECT setval(sequencename, last_value) 
FROM backup_$(date +%Y%m%d).sequence_values;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;
```

**Output Files**:
- `00-pre-migration.sql` - Backup and preparation
- `01-schema-migration.sql` - Table structure updates
- `02-data-migration.sql` - Data transfer with validation
- `03-sequence-reset.sql` - Sequence value preservation
- `rollback-migration.sql` - Complete rollback procedure
- `migration-log.sql` - Execution logging

**Validation Checks**:
- Row count verification for all 35 tables
- FK constraint validation
- Index performance testing
- Coordinate bounds checking (Central Java only)
- JSONB field structure validation

**Success Criteria**:
- All 35 tables migrated successfully with zero data loss
- FK constraints preserved and functional
- All 12+ indexes recreated with improved performance
- Sequence values maintained (incidents=44, intel_news=5140, historical=12641)
- Rollback tested and functional within 5 minutes
- Migration completes within 30 minutes

**Estimated Time**: 8 hours
