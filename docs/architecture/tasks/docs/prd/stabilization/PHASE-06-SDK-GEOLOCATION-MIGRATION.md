# Task PHASE-06-SDK-GEOLOCATION-MIGRATION

## Objective
Migrate SDK geolocation types to use shared-types Geolocation.

## Scope
Geolocation migration:
- Remove local Geolocation type
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-GEOLOCATION completed

## Implementation Steps
1. Find local Geolocation type in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Geolocation
- Removed local type
- Migration report

## Verification
- Geolocation from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types Geolocation
- No duplication
- Consistent type