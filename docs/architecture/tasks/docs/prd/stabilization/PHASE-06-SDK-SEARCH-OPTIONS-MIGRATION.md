# Task PHASE-06-SDK-SEARCH-OPTIONS-MIGRATION

## Objective
Migrate SDK SearchOptions type to use shared-types SearchOptions.

## Scope
SearchOptions migration:
- Remove local SearchOptions type
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-SEARCH-OPTIONS completed

## Implementation Steps
1. Find local SearchOptions type in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated SearchOptions
- Removed local type
- Migration report

## Verification
- SearchOptions from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types SearchOptions
- No duplication
- Consistent type