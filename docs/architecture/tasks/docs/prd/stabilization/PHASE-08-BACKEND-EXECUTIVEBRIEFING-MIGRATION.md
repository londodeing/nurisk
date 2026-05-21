# Task PHASE-08-BACKEND-EXECUTIVEBRIEFING-MIGRATION

## Objective
Migrate backend ExecutiveBriefing type to use shared-types.

## Scope
ExecutiveBriefing migration:
- Remove local ExecutiveBriefing type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local ExecutiveBriefing type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated ExecutiveBriefing
- Removed local type
- Migration report

## Verification
- ExecutiveBriefing from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types ExecutiveBriefing
- No duplication
- Consistent type