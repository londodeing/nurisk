# Task PHASE-03-INCIDENT-STATUS-UNIFICATION

## Objective
Unify incident status enums across the monorepo to use a single canonical definition.

## Scope
Incident status unification:
- Identify all incident status enums
- Select canonical source
- Remove duplicates
- Update consumers

## Files Target
- packages/shared-types/src/enums/
- packages/validation/src/
- packages/sdk/src/
- frontend-web/src/
- backend/src/

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-03-ENUM-CANONICALIZATION completed

## Implementation Steps
1. Search for all incident status enum definitions
2. Identify canonical source (Prisma)
3. Remove duplicate definitions
4. Update all imports
5. Verify TypeScript compiles
6. Document unification

## Deliverables
- Incident status enum unified
- Duplicates removed
- Import updates

## Verification
- Only one incident status enum exists
- All consumers use same enum
- TypeScript compiles

## Expected Result
- Incident status enum unified
- No duplicate definitions
- Consistent usage