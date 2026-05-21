# Task PHASE-07-FRONTEND-CONTRACT-CONSOLIDATION

## Objective
Consolidate all contract definitions in frontend to use shared-types as the single source.

## Scope
Contract consolidation:
- Entity imports
- Type imports
- Enum imports

## Files Target
- frontend-web/src/**/*.ts
- frontend-web/src/**/*.tsx

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-BUILD-VALIDATION completed
- PHASE-06-SDK-STABILIZATION completed

## Implementation Steps
1. Audit frontend for local type definitions
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
- Frontend uses shared-types
- No entity duplication
- Foundation for PHASE-07 subsequent tasks