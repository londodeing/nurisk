# Task PHASE-08-BACKEND-WAREHOUSE-MIGRATION

## Objective
Migrate backend Warehouse type to use shared-types Warehouse.

## Scope
Warehouse migration:
- Remove local Warehouse type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-WAREHOUSE completed

## Implementation Steps
1. Find local Warehouse type in backend
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
- Backend uses shared-types Warehouse
- No duplication
- Consistent type