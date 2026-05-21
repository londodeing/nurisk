# Task PHASE-06-SDK-SEVERITY-LEVEL-MIGRATION

## Objective
Migrate SDK SeverityLevel enum to use shared-types SeverityLevel.

## Scope
SeverityLevel migration:
- Remove local SeverityLevel enum
- Import from shared-types
- Update consumers

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SHARED-TYPES-INTEGRATION completed
- PHASE-02-SHARED-TYPES-SEVERITY-LEVEL completed

## Implementation Steps
1. Find local SeverityLevel enum in SDK
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated SeverityLevel
- Removed local enum
- Migration report

## Verification
- SeverityLevel from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- SDK uses shared-types SeverityLevel
- No duplication
- Consistent enum