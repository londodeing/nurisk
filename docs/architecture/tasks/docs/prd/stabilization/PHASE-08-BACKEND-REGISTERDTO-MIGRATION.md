# Task PHASE-08-BACKEND-REGISTERDTO-MIGRATION

## Objective
Migrate backend RegisterDto to use shared-types.

## Scope
RegisterDto migration:
- Remove local RegisterDto
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local RegisterDto in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated RegisterDto
- Removed local type
- Migration report

## Verification
- RegisterDto from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types RegisterDto
- No duplication
- Consistent type