# Task PHASE-11-CI-SHARED-TYPES-BUILD-GATE

## Objective
Add shared-types build gate to CI pipeline to ensure types always build.

## Scope
CI gate:
- shared-types build step
- Declaration validation
- Failure handling

## Files Target
- .github/workflows/*.yml

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-11-GOVERNANCE-ENFORCEMENT completed
- PHASE-02-SHARED-TYPES-BUILD-VALIDATION completed

## Implementation Steps
1. Add shared-types build step to CI
2. Add declaration validation step
3. Configure failure handling
4. Test CI pipeline
5. Document gate requirements

## Deliverables
- shared-types build gate in CI
- Pipeline tested
- Documentation

## Verification
- CI fails on shared-types build errors
- Declarations validated
- Gate blocks merges

## Expected Result
- shared-types build gate active
- Types always build
- Declarations validated