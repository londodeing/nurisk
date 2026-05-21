# Task PHASE-08-BACKEND-MISSION-MIGRATION

## Objective
Migrate backend Mission type to use shared-types Mission.

## Scope
Mission migration:
- Remove local Mission type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-MISSION completed

## Implementation Steps
1. Find local Mission type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Mission
- Removed local type
- Migration report

## Verification
- Mission from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types Mission
- No duplication
- Consistent type