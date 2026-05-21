# Task PHASE-08-BACKEND-SAFEUSER-MIGRATION

## Objective
Migrate backend SafeUser type to use shared-types.

## Scope
SafeUser migration:
- Remove local SafeUser type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local SafeUser type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated SafeUser
- Removed local type
- Migration report

## Verification
- SafeUser from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types SafeUser
- No duplication
- Consistent type