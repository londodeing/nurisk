# Task PHASE-07-FRONTEND-SHELTER-MIGRATION

## Objective
Migrate frontend Shelter type to use shared-types Shelter.

## Scope
Shelter migration:
- Remove local Shelter type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-SHELTER completed

## Implementation Steps
1. Find local Shelter type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Shelter
- Removed local type
- Migration report

## Verification
- Shelter from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types Shelter
- No duplication
- Consistent type