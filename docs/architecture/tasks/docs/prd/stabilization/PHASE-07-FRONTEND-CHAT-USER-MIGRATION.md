# Task PHASE-07-FRONTEND-CHAT-USER-MIGRATION

## Objective
Migrate frontend ChatUser type to use shared-types ChatUser.

## Scope
ChatUser migration:
- Remove local ChatUser type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-CHAT-USER completed

## Implementation Steps
1. Find local ChatUser type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated ChatUser
- Removed local type
- Migration report

## Verification
- ChatUser from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types ChatUser
- No duplication
- Consistent type