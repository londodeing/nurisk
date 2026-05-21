# Contributing to NURisk

## Migration Review Checklist

Before merging any Prisma migration PR, verify each of the following:

### Schema Changes
- [ ] Schema change is backward-compatible (no dropping columns/tables that may still be in use)
- [ ] New columns have sensible defaults or are nullable
- [ ] No renaming of existing columns or tables without a dual-write strategy
- [ ] Enum changes only append new values; existing values are never removed
- [ ] New indexes are added in a separate migration from column additions when possible
- [ ] `@@index` or `@@unique` annotations are used instead of raw DDL where possible

### Data Integrity
- [ ] Soft delete (`deletedAt`) is present on all new tables
- [ ] `createdAt` and `updatedAt` timestamps are present on all new tables
- [ ] UUID primary keys use `@default(uuid())`
- [ ] Foreign keys reference the correct target columns
- [ ] Cascade/restrict behavior is explicitly defined on all relations

### PostGIS & Spatial
- [ ] All geometry columns use `Unsupported("geography(Point, 4326)")` (or appropriate geography type)
- [ ] GiST indexes are added for all geography columns
- [ ] New spatial queries are tested with `ST_DWithin`, `ST_Distance`, etc.

### Migration SQL
- [ ] Generated migration SQL is reviewed manually
- [ ] No raw DDL outside of PostGIS extensions or custom indexes
- [ ] Migration runs cleanly with `prisma migrate deploy` on a staging copy of production
- [ ] Migration is reversible (has a corresponding `prisma migrate resolve --rolled-back` plan)

### Pre-Release Squash
- [ ] Pre-release migrations are squashed into a single baseline before first production deploy
- [ ] Squash is verified by running `prisma migrate deploy` on a clean database
- [ ] Squashed migration SQL is reviewed to ensure no data loss

### CI/CD
- [ ] `prisma migrate status` passes with no unapplied migrations before deploy
- [ ] Migration runs as part of the deploy pipeline (see `.github/workflows/deploy-migrations.yml`)
- [ ] Rollback procedure is documented and tested

## Development Workflow

1. Create a branch from `main`
2. Make schema changes in `schema.prisma`
3. Run `npx prisma migrate dev --name <description>` to create a migration
4. Test locally with `npx prisma migrate deploy`
5. Push branch and open a PR
6. Ensure all CI checks pass
7. Request a review with the migration checklist above

## Running Migrations

```bash
# Development
./apps/backend/prisma/migrate.sh dev deploy

# Staging
./apps/backend/prisma/migrate.sh staging deploy

# Production
./apps/backend/prisma/migrate.sh prod deploy
```

## Squashing Migrations

Before the first production deployment, consolidate pre-release migrations:

```bash
cd apps/backend/prisma
./squash.sh dev init
# Review the generated SQL, then:
./migrate.sh dev deploy
```

## Rollback Procedures

If a migration needs to be rolled back after deployment:

### 1. Revert the schema changes manually

Apply the inverse SQL to the database (e.g., `ALTER TABLE ... DROP COLUMN`, `DROP TABLE`).

### 2. Mark the migration as rolled back

```bash
# Mark a specific migration as rolled back in the _prisma_migrations table
npx prisma migrate resolve --rolled-back <migration_name>

# Example:
cd apps/backend/prisma
DATABASE_DIRECT_URL="<direct-database-url>" npx prisma migrate resolve --rolled-back 20260513124231_add_region_zone_evacuationroute
```

### 3. Verify status

```bash
DATABASE_DIRECT_URL="<direct-database-url>" npx prisma migrate status
```

### Full rollback example

```bash
# 1. Connect to the database and run the inverse SQL (example)
#    psql "$DATABASE_DIRECT_URL" -c "ALTER TABLE incidents DROP COLUMN IF EXISTS new_column;"

# 2. Mark the failed/pending migration as rolled back
DATABASE_DIRECT_URL="<direct-database-url>" npx prisma migrate resolve --rolled-back 20260513124300_create_spatial_indexes

# 3. Verify the rollback
DATABASE_DIRECT_URL="<direct-database-url>" npx prisma migrate status
```

### Alternative: Restore from backup

For catastrophic failures, restore the database from the latest backup and re-apply migrations:

```bash
# Restore (see backup documentation for details)
pg_restore -d nurisk latest_backup.dump

# Re-apply any migrations that were deployed after the backup
DATABASE_DIRECT_URL="<direct-database-url>" npx prisma migrate deploy
```

> **Important:** Rollback via `migrate resolve --rolled-back` only updates the migration tracking table. It does NOT reverse the schema changes — you must manually apply the inverse DDL first. Always test rollbacks on a staging environment before applying to production.
