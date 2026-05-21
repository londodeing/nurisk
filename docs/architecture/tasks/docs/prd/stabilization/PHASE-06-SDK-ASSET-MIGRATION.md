# Task PHASE-06-SDK-ASSET-MIGRATION

## Objective
Migrate SDK asset-related types to use shared-types.

## Scope
Asset migration:
- Identify asset types
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed

## Implementation Steps
1. Find local asset types in SDK
2. Remove local definitions
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated asset types
- Removed local types
- Migration report

## Verification
- Asset types from shared-types
- No local definitions
- TypeScript compiles

## Expected Result
- SDK uses shared-types assets
- No duplication
- Consistent types