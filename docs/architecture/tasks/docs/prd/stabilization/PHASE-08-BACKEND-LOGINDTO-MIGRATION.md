# Task PHASE-08-BACKEND-LOGINDTO-MIGRATION

## Objective
Migrate backend LoginDto to use shared-types.

## Scope
LoginDto migration:
- Remove local LoginDto
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local LoginDto in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated LoginDto
- Removed local type
- Migration report

## Verification
- LoginDto from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types LoginDto
- No duplication
- Consistent type