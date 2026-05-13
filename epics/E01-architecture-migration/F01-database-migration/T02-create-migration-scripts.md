# T02 - Create Migration Scripts

**Task**: Create automated scripts to migrate database schema and data

**Input**: 
- Schema dependency analysis from T01
- nuriskanyar.sql dump file
- Current sequence values (incidents_id_seq=44, intel_news_id_seq=5140, etc.)

**Output**:
- migration-up.sql - Forward migration
- migration-down.sql - Rollback script
- data-validation.sql - Integrity checks
- sequence-reset.sql - Preserve sequence values

**Migration Order** (based on FK dependencies):
1. users (no dependencies)
2. volunteers (depends on users)
3. incidents (no dependencies)
4. volunteer_deployments (depends on incidents, volunteers)
5. incident_instructions (depends on incidents)
6. All other dependent tables

**Commands**:
```sql
-- Preserve sequences
SELECT setval('incidents_id_seq', 44);
SELECT setval('intel_news_id_seq', 5140);
SELECT setval('historical_disasters_id_seq', 12641);
SELECT setval('users_id_seq', 27);
```

**Success Criteria**:
- All 35 tables migrated successfully
- FK constraints preserved
- Indexes recreated
- Sequence values maintained
- Zero data loss verified

**Estimated Time**: 4 hours
