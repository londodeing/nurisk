# Task PHASE-05-CAMELCASE-INTERNAL-CONTRACTS

## Objective
Ensure all internal contracts use camelCase consistently without naming leakage from transport layer.

## Scope
Internal contracts:
- Service contracts
- Repository contracts
- Internal DTOs

## Files Target
- backend/src/**/*.ts
- packages/sdk/src/**/*.ts
- packages/validation/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-05-SNAKE-CASE-TRANSFORMATION-LAYER completed

## Implementation Steps
1. Audit internal contract naming
2. Identify any snake_case usage
3. Convert to camelCase
4. Ensure transformation at boundaries
5. Verify TypeScript compiles
6. Document naming policy

## Deliverables
- Internal contract audit
- Naming fixes
- Policy documentation

## Verification
- All internal contracts use camelCase
- Boundaries transform correctly
- TypeScript compiles

## Expected Result
- Internal contracts are camelCase
- Transport boundaries transform
- No naming leakage