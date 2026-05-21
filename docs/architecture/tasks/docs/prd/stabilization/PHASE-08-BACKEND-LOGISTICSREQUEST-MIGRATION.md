# Task PHASE-08-BACKEND-LOGISTICSREQUEST-MIGRATION

## Objective
Migrate backend LogisticsRequest type to use shared-types LogisticsRequest.

## Scope
LogisticsRequest migration:
- Remove local LogisticsRequest type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-LOGISTICS-REQUEST completed

## Implementation Steps
1. Find local LogisticsRequest type in backend
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
- Backend uses shared-types LogisticsRequest
- No duplication
- Consistent type