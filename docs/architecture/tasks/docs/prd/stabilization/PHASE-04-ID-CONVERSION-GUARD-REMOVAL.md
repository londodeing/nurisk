# Task PHASE-04-ID-CONVERSION-GUARD-REMOVAL

## Objective
Remove all ID conversion utilities and guards that bridge numeric and UUID ID types.

## Scope
Conversion guard removal:
- String/number conversion functions
- ID casting utilities
- Type assertion helpers

## Files Target
- packages/shared-types/src/utils/
- packages/sdk/src/utils/
- packages/validation/src/utils/
- backend/src/utils/
- frontend-web/src/utils/

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-NUMERIC-ID-REMOVAL completed

## Implementation Steps
1. Search for ID conversion utilities
2. Identify conversion guards
3. Remove unnecessary converters
4. Update callers to use direct UUID
5. Verify TypeScript compiles
6. Document removed utilities

## Deliverables
- Removed conversion utilities
- Updated callers
- Removal report

## Verification
- No ID conversion utilities remain
- TypeScript compiles
- No implicit conversions

## Expected Result
- Conversion guards removed
- Direct UUID usage
- Cleaner ID handling