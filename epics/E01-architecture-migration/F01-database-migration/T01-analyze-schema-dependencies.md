# T01 - Analyze Current Schema Dependencies

**Task**: Document all FK relationships and constraints from nuriskanyar.sql

**Input**: 
- c:\nurisk\backend\nuriskanyar.sql (1,923,455 bytes)
- Current table structure (35 tables)

**Output**:
- Complete dependency graph
- Migration order sequence
- Constraint validation checklist

**Commands**:
```sql
-- Extract all FK constraints
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Success Criteria**:
- All 35 tables documented
- FK relationships mapped
- Index requirements identified
- Sequence values preserved

**Estimated Time**: 2 hours
