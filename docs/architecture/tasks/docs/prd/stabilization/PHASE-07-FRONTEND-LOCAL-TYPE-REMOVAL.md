# Task PHASE-07-FRONTEND-LOCAL-TYPE-REMOVAL

## Objective
Remove all remaining local type definitions in frontend that are now available in shared-types.

## Scope
Type removal:
- Entity types
- Enum types
- Utility types

## Files Target
- frontend-web/src/types/
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- All PHASE-07 migration tasks completed

## Implementation Steps
1. Audit frontend for remaining local types
2. Identify types now in shared-types
3. Remove local definitions
4. Update all references
5. Verify TypeScript compiles
6. Document removals

## Deliverables
- Removed local types
- Updated references
- Removal report

## Verification
- No local entity types remain
- All references updated
- TypeScript compiles

## Expected Result
- All local types removed
- Frontend uses shared-types only
- Clean frontend type layer