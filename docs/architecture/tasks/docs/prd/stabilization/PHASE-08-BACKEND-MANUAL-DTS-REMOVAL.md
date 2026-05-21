# Task PHASE-08-BACKEND-MANUAL-DTS-REMOVAL

## Objective
Remove manual .d.ts declaration files from backend that are no longer needed.

## Scope
DTS removal:
- Remove identified manual .d.ts files
- Update imports
- Verify TypeScript compiles

## Files Target
- backend/src/**/*.d.ts
- backend/**/*.d.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-08-BACKEND-MANUAL-DTS-AUDIT completed

## Implementation Steps
1. Remove identified manual .d.ts files
2. Update any imports referencing removed files
3. Verify TypeScript compiles
4. Run full backend typecheck
5. Document removals

## Deliverables
- Removed .d.ts files
- Updated imports
- Removal report

## Verification
- Manual .d.ts files removed
- No broken imports
- TypeScript compiles

## Expected Result
- Manual .d.ts files removed
- Generated types only
- Foundation for PHASE-11 declaration elimination