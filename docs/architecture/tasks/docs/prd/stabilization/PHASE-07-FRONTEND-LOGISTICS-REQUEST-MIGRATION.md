# Task PHASE-07-FRONTEND-LOGISTICS-REQUEST-MIGRATION

## Objective
Migrate frontend LogisticsRequest type to use shared-types LogisticsRequest.

## Scope
LogisticsRequest migration:
- Remove local LogisticsRequest type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-LOGISTICS-REQUEST completed

## Implementation Steps
1. Find local LogisticsRequest type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated LogisticsRequest
- Removed local type
- Migration report

## Verification
- LogisticsRequest from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types LogisticsRequest
- No duplication
- Consistent type