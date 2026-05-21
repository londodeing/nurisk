# Task PHASE-06-SDK-RISK-FILTERS-MIGRATION

## Objective
Migrate SDK RiskFilters type to use shared-types RiskFilters.

## Scope
RiskFilters migration:
- Remove local RiskFilters type
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-RISK-FILTERS completed

## Implementation Steps
1. Find local RiskFilters type in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated RiskFilters
- Removed local type
- Migration report

## Verification
- RiskFilters from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types RiskFilters
- No duplication
- Consistent type