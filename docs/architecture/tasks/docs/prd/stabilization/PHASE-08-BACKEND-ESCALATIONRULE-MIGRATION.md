# Task PHASE-08-BACKEND-ESCALATIONRULE-MIGRATION

## Objective
Migrate backend EscalationRule type to use shared-types.

## Scope
EscalationRule migration:
- Remove local EscalationRule type
- Import from shared-types
- Update consumers

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-CONTRACT-CONSOLIDATION completed

## Implementation Steps
1. Find local EscalationRule type in backend
2. Remove local definition
3. Import from shared-types
4. Update all references
5. Verify TypeScript compiles
6. Document migration

## Deliverables
- Migrated EscalationRule
- Removed local type
- Migration report

## Verification
- EscalationRule from shared-types
- No local definition
- TypeScript compiles

## Expected Result
- Backend uses shared-types EscalationRule
- No duplication
- Consistent type