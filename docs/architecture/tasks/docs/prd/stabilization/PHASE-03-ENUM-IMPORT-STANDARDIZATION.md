# Task PHASE-03-ENUM-IMPORT-STANDARDIZATION

## Objective
Standardize all enum imports across the monorepo to use shared-types as the single import source.

## Scope
Import standardization:
- SDK imports
- Frontend imports
- Backend imports
- Validation imports

## Files Target
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts
- frontend-web/src/**/*.ts
- backend/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-03-ENUM-CONSUMER-AUDIT completed

## Implementation Steps
1. Identify all enum import statements
2. Categorize by source (canonical vs non-canonical)
3. Update non-canonical imports to shared-types
4. Remove any local enum definitions
5. Verify all imports resolve
6. Verify TypeScript compiles

## Deliverables
- Standardized imports
- Removed local enums
- Import update report

## Verification
- All enum imports from shared-types
- No local enum definitions
- TypeScript compiles

## Expected Result
- Consistent enum imports
- shared-types is single source
- No enum drift