# Task PHASE-02-SHARED-TYPES-SEARCH-OPTIONS

## Objective
Add SearchOptions type to shared-types as a canonical contract for search parameters.

## Scope
SearchOptions type:
- Interface definition
- Pagination fields
- Sort options
- Export

## Files Target
- packages/shared-types/src/types/SearchOptions.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Define SearchOptions interface
2. Include pagination fields
3. Add sort options
4. Export from index.ts
5. Verify TypeScript compiles
6. Document SearchOptions type

## Deliverables
- SearchOptions interface
- Export added
- Documentation

## Verification
- SearchOptions interface is valid TypeScript
- Exported from shared-types
- No duplicate SearchOptions definition

## Expected Result
- SearchOptions type in shared-types
- Canonical contract established
- Ready for migration