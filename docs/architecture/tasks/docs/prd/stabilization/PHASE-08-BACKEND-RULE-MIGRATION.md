# Task PHASE-08-BACKEND-RULE-MIGRATION

## Objective
Migrate backend Rule type to use shared-types.

## Scope
Rule migration:
- Remove local Rule type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local Rule type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Rule
- Removed local type
- Migration report

## Verification
- Rule from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types Rule
- No duplication
- Consistent type