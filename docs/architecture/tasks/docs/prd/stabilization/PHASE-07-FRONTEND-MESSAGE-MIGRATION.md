# Task PHASE-07-FRONTEND-MESSAGE-MIGRATION

## Objective
Migrate frontend Message type to use shared-types Message.

## Scope
Message migration:
- Remove local Message type
- Import from shared-types
- Update consumers

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION completed
- PHASE-02-SHARED-TYPES-MESSAGE completed

## Implementation Steps
1. Find local Message type in frontend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated Message
- Removed local type
- Migration report

## Verification
- Message from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Frontend uses shared-types Message
- No duplication
- Consistent type