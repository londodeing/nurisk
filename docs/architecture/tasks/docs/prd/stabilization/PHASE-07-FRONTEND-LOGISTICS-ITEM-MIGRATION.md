# Task PHASE-07-FRONTEND-LOGISTICS-ITEM-MIGRATION

## Objective
Migrate frontend LogisticsItem type to use shared-types LogisticsItem.

## Scope
LogisticsItem migration:
- Remove local LogisticsItem type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-LOGISTICS-ITEM completed

## Implementation Steps
1. Find local LogisticsItem type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated LogisticsItem
- Removed local type
- Migration report

## Verification
- LogisticsItem from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types LogisticsItem
- No duplication
- Consistent type