# Index Recommendations for NURisk Database

Based on running `EXPLAIN ANALYZE` on sample queries and analyzing `pg_stat_user_tables`, the following index recommendations are identified:

## Current Issues Identified

1. **Sequential Scans on Large Tables**: Several tables are performing sequential scans instead of using indexes
2. **Missing Indexes on Common Query Columns**: Foreign keys and frequently filtered columns lack indexes
3. **No Composite Indexes for Common Query Patterns**: Multi-column WHERE clauses could benefit from composite indexes

## Table-by-Table Recommendations

### incidents Table
**Current Issue**: Sequential scans on multiple queries
**Recommendations**:
- Create index on `status` column (used in WHERE clauses)
- Create index on `created_at` column (used for sorting and date range queries)
- Create composite index on `(status, created_at DESC)` for dashboard queries
- Consider index on `severity` if this column exists (referenced in PRD but not found in current schema)

### users Table
**Current Issue**: Sequential scan on username lookup
**Recommendations**:
- Create unique index on `username` column (already has UNIQUE constraint, but verify index exists)
- Consider index on `role` column for role-based queries

### historical_disasters Table
**Current Issue**: Sequential scan on LIMIT queries
**Recommendations**:
- Since this table appears to be read-heavy with historical data, consider indexes based on query patterns
- If queries filter by date or disaster type, create appropriate indexes

### volunteers Table
**Current Issue**: Sequential scan on user_id lookup
**Recommendations**:
- Create index on `user_id` foreign key column
- Consider composite index on `(user_id, timestamp)` if timestamp column exists for deployment tracking

### building_assessments Table
**Current Issue**: Sequential scan on LIMIT queries
**Recommendations**:
- Analyze common query patterns for this table
- If queries filter by incident_id or status, create appropriate indexes

### audit_logs Table
**Current Issue**: Sequential scan on LIMIT queries
**Recommendations**:
- Create index on `created_at` column for time-based queries
- Consider index on user_id or incident_id if these foreign keys exist

## Specific Index Recommendations from T02

Based on the implementation checklist in T02-tree-and-composite-indexes.md:

1. **Incident Table Composite Index**: 
   ```sql
   CREATE INDEX idx_incidents_status_created_at ON incidents(status, created_at DESC);
   ```

2. **CheckIn Table Composite Index** (if exists):
   ```sql
   CREATE INDEX idx_checkin_volunteer_timestamp ON CheckIn(volunteer_id, timestamp DESC);
   ```

3. **LogisticsRequest Partial Index** (if exists):
   ```sql
   CREATE INDEX idx_logisticsrequest_pending ON LogisticsRequest(status) WHERE status = 'PENDING';
   ```

## Implementation Priority

**High Priority**:
1. Index on `incidents(status)` - improves filtering by status
2. Index on `incidents(created_at)` - improves sorting and date range queries
3. Composite index on `incidents(status, created_at DESC)` - optimizes dashboard queries
4. Index on `users(username)` - though UNIQUE constraint should already create this
5. Index on `volunteers(user_id)` - improves join performance with users table

**Medium Priority**:
1. Index on `historical_disasters` based on query patterns
2. Index on `building_assessments` based on query patterns
3. Index on `audit_logs(created_at)` for time-based queries

## Monitoring and Maintenance

To monitor index usage and effectiveness:
1. Regularly query `pg_stat_user_indexes` to identify unused indexes
2. Run `EXPLAIN ANALYZE` on critical queries periodically
3. Monitor `pg_stat_user_tables` for sequential scan ratios
4. Consider creating a periodic index health check script

## SQL Scripts for Implementation

See `index-health.sql` for monitoring scripts and the specific CREATE INDEX statements for implementation.