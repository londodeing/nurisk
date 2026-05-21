# Task PHASE-07-FRONTEND-MAP-SHELTER-MIGRATION

## Objective
Migrate frontend map shelter types to use shared-types Shelter.

## Scope
Map shelter migration:
- Map component types
- Shelter display types
- Marker types

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-SHELTER completed

## Implementation Steps
1. Find local shelter types in map components
2. Remove local definitions
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated map shelter types
- Removed local types
- Migration report

## Verification
- Shelter from shared-types
- No local definitions
- TypeScript compiles

## Expected Result
- Map uses shared-types Shelter
- No duplication
- Consistent types