# Task PHASE-11-CI-PRISMA-GENERATE-GATE

## Objective
Add Prisma generate gate to CI pipeline to ensure schema is always generated.

## Scope
CI gate:
- Prisma generate step
- Validation step
- Failure handling

## Files Target
- .github/workflows/*.yml

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-11-GOVERNANCE-ENFORCEMENT completed
- PHASE-01-PRISMA-GENERATE-PIPELINE completed

## Implementation Steps
1. Add prisma validate step to CI
2. Add prisma generate step to CI
3. Configure failure handling
4. Test CI pipeline
5. Document gate requirements

## Deliverables
- Prisma gate in CI
- Pipeline tested
- Documentation

## Verification
- CI fails on schema errors
- Generate step runs
- Gate blocks merges

## Expected Result
- Prisma gate active
- Schema always generated
- No stale generated code