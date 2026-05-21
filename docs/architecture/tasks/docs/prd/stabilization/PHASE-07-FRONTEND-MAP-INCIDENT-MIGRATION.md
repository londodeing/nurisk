# Task PHASE-07-FRONTEND-MAP-INCIDENT-MIGRATION

## Objective
Migrate frontend map incident types to use shared-types Incident.

## Scope
Map incident migration:
- Map component types
- Incident display types
- Marker types

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-INCIDENT completed

## Implementation Steps
1. Find local incident types in map components
2. Remove local definitions
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated map incident types
- Removed local types
- Migration report

## Verification
- Incident from shared-types
- No local definitions
- TypeScript compiles

## Expected Result
- Map uses shared-types Incident
- No duplication
- Consistent types