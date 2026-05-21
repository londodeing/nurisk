# Task PHASE-07-FRONTEND-WAREHOUSE-MIGRATION

## Objective
Migrate frontend Warehouse type to use shared-types Warehouse.

## Scope
Warehouse migration:
- Remove local Warehouse type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-WAREHOUSE completed

## Implementation Steps
1. Find local Warehouse type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Warehouse
- Removed local type
- Migration report

## Verification
- Warehouse from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types Warehouse
- No duplication
- Consistent type