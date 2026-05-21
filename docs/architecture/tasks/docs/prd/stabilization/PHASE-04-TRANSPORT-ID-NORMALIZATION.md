# Task PHASE-04-TRANSPORT-ID-NORMALIZATION

## Objective
Normalize transport layer ID handling to use UUID string in API contracts.

## Scope
Transport ID normalization:
- SDK method parameters
- SDK return types
- API request/response types

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-04-ID-NORMALIZATION completed

## Implementation Steps
1. Identify all SDK transport methods
2. Audit ID parameter types
3. Update to UUID string
4. Update return types
5. Update API contracts
6. Verify TypeScript compiles
7. Document changes

## Deliverables
- SDK update report
- Updated transport methods
- Documentation

## Verification
- All SDK methods use UUID IDs
- TypeScript compiles
- API contracts are consistent

## Expected Result
- Transport layer normalized
- Consistent ID in API
- Type-safe SDK