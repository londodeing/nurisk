# Task PHASE-06-SDK-VOLUNTEER-MIGRATION

## Objective
Migrate SDK Volunteer type to use shared-types Volunteer.

## Scope
Volunteer migration:
- Remove local Volunteer type
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-VOLUNTEER completed

## Implementation Steps
1. Find local Volunteer type in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Volunteer
- Removed local type
- Migration report

## Verification
- Volunteer from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types Volunteer
- No duplication
- Consistent type