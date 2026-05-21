# Task PHASE-06-SDK-INCIDENT-MIGRATION

## Objective
Migrate SDK Incident type to use shared-types Incident.

## Scope
Incident migration:
- Remove local Incident type
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-INCIDENT completed

## Implementation Steps
1. Find local Incident type in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Incident
- Removed local type
- Migration report

## Verification
- Incident from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types Incident
- No duplication
- Consistent type