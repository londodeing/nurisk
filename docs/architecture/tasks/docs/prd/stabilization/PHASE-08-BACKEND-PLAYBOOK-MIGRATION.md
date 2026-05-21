# Task PHASE-08-BACKEND-PLAYBOOK-MIGRATION

## Objective
Migrate backend Playbook type to use shared-types.

## Scope
Playbook migration:
- Remove local Playbook type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local Playbook type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Playbook
- Removed local type
- Migration report

## Verification
- Playbook from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types Playbook
- No duplication
- Consistent type