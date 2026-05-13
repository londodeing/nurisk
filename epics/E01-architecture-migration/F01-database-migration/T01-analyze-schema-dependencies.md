# T01 - Analyze Current Schema Dependencies

**Task**: Document all FK relationships and constraints from nuriskanyar.sql

**Input**: 
- c:\nurisk\backend\nuriskanyar.sql (1,923,455 bytes)
- Current table structure (35 tables)

**Detailed Analysis Steps**:

1. **Extract Table Structure**:
```sql
-- Get all tables with column details
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Get all constraints
SELECT tc.constraint_name, tc.table_name, tc.constraint_type, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public';
```

2. **Map Foreign Key Dependencies**:
```sql
-- Extract all FK relationships with detailed info
SELECT 
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column,
    tc.constraint_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

3. **Identify Critical Dependencies** (from mainprd.md):
- `volunteers.user_id` → `users.id` (CASCADE DELETE)
- `volunteer_deployments.incident_id` → `incidents.id`
- `volunteer_deployments.volunteer_id` → `volunteers.id`
- `incident_instructions.incident_id` → `incidents.id` (UNIQUE constraint)
- `chat_messages.sender_id` → `users.id`
- `organizations.parent_id` → `organizations.id` (self-referencing)

4. **Document Sequence Dependencies**:
```sql
-- Get current sequence values
SELECT schemaname, sequencename, last_value 
FROM pg_sequences 
WHERE schemaname = 'public';
```

**Migration Order** (dependency-safe):
1. **Independent tables**: `users`, `incidents`, `organizations` (root level)
2. **Level 1 dependencies**: `volunteers` (depends on users)
3. **Level 2 dependencies**: `volunteer_deployments` (depends on incidents + volunteers)
4. **Level 3 dependencies**: `incident_instructions`, `chat_conversations`
5. **Level 4 dependencies**: `chat_messages`, `incident_actions`

**Output Files**:
- `schema-analysis.json` - Complete table structure
- `dependency-graph.json` - FK relationships mapped
- `migration-order.json` - Safe migration sequence
- `constraints-checklist.md` - Validation requirements

**Success Criteria**:
- All 35 tables documented with column details
- FK relationships mapped with CASCADE rules
- Index requirements identified (12+ existing indexes)
- Sequence values preserved (incidents_id_seq=44, intel_news_id_seq=5140, etc.)
- Migration order prevents constraint violations

**Estimated Time**: 4 hours
