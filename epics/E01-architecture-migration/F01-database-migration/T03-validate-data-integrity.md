# T03 - Validate Data Integrity

**Task**: Ensure all data migrated correctly with referential integrity

**Validation Checks**:
- Row counts match (27 users, 44 incidents, 5140 intel_news, 12641 historical_disasters)
- FK relationships intact
- Unique constraints preserved
- JSONB data structure valid
- Coordinate data within Central Java bounds

**Validation Queries**:
```sql
-- Verify row counts
SELECT 'users' as table_name, count(*) FROM users
UNION ALL
SELECT 'incidents', count(*) FROM incidents
UNION ALL
SELECT 'intel_news', count(*) FROM intel_news
UNION ALL
SELECT 'historical_disasters', count(*) FROM historical_disasters;

-- Verify FK integrity
SELECT COUNT(*) as orphaned_volunteers 
FROM volunteers v 
LEFT JOIN users u ON v.user_id = u.id 
WHERE u.id IS NULL;

-- Verify coordinate bounds for Central Java
SELECT COUNT(*) as out_of_bounds
FROM incidents 
WHERE latitude NOT BETWEEN -8.8 AND -5.4 
   OR longitude NOT BETWEEN 108.3 AND 111.9;
```

**Success Criteria**:
- All row counts match expected values
- Zero orphaned records
- All coordinates within bounds
- JSONB fields parseable
- Indexes functional

**Estimated Time**: 2 hours
