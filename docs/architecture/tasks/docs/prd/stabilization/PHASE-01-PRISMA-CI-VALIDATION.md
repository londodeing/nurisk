# Task PHASE-01-PRISMA-CI-VALIDATION

## Objective
Add Prisma validation to CI pipeline to ensure schema changes are validated before merge.

## Scope
Add CI validation:
- Schema validation step
- Generate step
- Type check step

## Files Target
- .github/workflows/*.yml
- backend/package.json

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-GENERATE-PIPELINE completed

## Implementation Steps
1. Identify CI workflow files
2. Add prisma validate step
3. Add prisma generate step
4. Add type checking for generated types
5. Configure failure on validation errors
6. Test CI pipeline locally

## Deliverables
- CI validation steps added
- Pipeline tested
- Documentation updated

## Verification
- CI pipeline validates Prisma schema
- Failures block merge
- Validation is fast and reliable

## Expected Result
- Prisma validation in CI
- Schema changes validated automatically
- Foundation for PHASE-11 CI gates