# Task PHASE-05-VALIDATION-IMPORT-STANDARDIZATION

## Objective
Standardize all imports in validation layer to use shared-types for entity definitions.

## Scope
Import standardization:
- Entity imports
- Enum imports
- Type imports

## Files Target
- packages/validation/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-05-ZOD-SCHEMA-CONSOLIDATION completed

## Implementation Steps
1. Audit all imports in validation
2. Identify non-shared-types imports
3. Update to import from shared-types
4. Remove local type definitions
5. Verify all imports resolve
6. Verify TypeScript compiles

## Deliverables
- Standardized imports
- Removed local types
- Import audit report

## Verification
- All imports from shared-types
- No local entity definitions
- TypeScript compiles

## Expected Result
- Validation imports standardized
- shared-types is single source
- No duplicate definitions