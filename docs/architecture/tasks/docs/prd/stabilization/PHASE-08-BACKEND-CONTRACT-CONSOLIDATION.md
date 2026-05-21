# Task PHASE-08-BACKEND-CONTRACT-CONSOLIDATION

## Objective
Consolidate all contract definitions in backend to use shared-types as the single source.

## Scope
Contract consolidation:
- DTO imports
- Type imports
- Enum imports

## Files Target
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-BUILD-VALIDATION completed
- PHASE-06-SDK-STABILIZATION completed

## Implementation Steps
1. Audit backend for local type definitions
2. Identify non-shared-types imports
3. Update imports to use shared-types
4. Remove local type definitions
5. Verify TypeScript compiles
6. Document consolidation

## Deliverables
- Contract consolidation
- Removed local types
- Consolidation report

## Verification
- All contracts from shared-types
- No local entity definitions
- TypeScript compiles

## Expected Result
- Backend uses shared-types
- No entity duplication
- Foundation for PHASE-08 subsequent tasks