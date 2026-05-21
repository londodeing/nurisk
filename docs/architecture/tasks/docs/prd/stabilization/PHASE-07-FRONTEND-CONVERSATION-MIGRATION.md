# Task PHASE-07-FRONTEND-CONVERSATION-MIGRATION

## Objective
Migrate frontend Conversation type to use shared-types Conversation.

## Scope
Conversation migration:
- Remove local Conversation type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-CONVERSATION completed

## Implementation Steps
1. Find local Conversation type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Conversation
- Removed local type
- Migration report

## Verification
- Conversation from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types Conversation
- No duplication
- Consistent type