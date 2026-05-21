# Task PHASE-06-SDK-HAZARD-TYPE-MIGRATION

## Objective
Migrate SDK HazardType enum to use shared-types HazardType.

## Scope
HazardType migration:
- Remove local HazardType enum
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-HAZARD-TYPE completed

## Implementation Steps
1. Find local HazardType enum in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated HazardType
- Removed local enum
- Migration report

## Verification
- HazardType from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types HazardType
- No duplication
- Consistent enum