# Task PHASE-07-FRONTEND-INCIDENT-FILTERS-MIGRATION

## Objective
Migrate frontend incident filter types to use shared-types RiskFilters.

## Scope
Filter migration:
- Filter component types
- Filter state types
- Filter option types

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-RISK-FILTERS completed

## Implementation Steps
1. Find local filter types in frontend
2. Remove local definitions
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated filter types
- Removed local types
- Migration report

## Verification
- Filters from shared-types
- No local definitions
- TypeScript compiles

## Expected Result
- Frontend uses shared-types filters
- No duplication
- Consistent types