# Task PHASE-08-BACKEND-CREATENOTIFICATIONDTO-MIGRATION

## Objective
Migrate backend CreateNotificationDto to use shared-types.

## Scope
CreateNotificationDto migration:
- Remove local CreateNotificationDto
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local CreateNotificationDto in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated CreateNotificationDto
- Removed local type
- Migration report

## Verification
- CreateNotificationDto from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types CreateNotificationDto
- No duplication
- Consistent type