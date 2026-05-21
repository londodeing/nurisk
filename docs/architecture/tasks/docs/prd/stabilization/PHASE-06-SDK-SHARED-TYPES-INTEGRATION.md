# Task PHASE-06-SDK-SHARED-TYPES-INTEGRATION

## Objective
Integrate SDK with shared-types to eliminate local entity duplications.

## Scope
Shared-types integration:
- Import entities from shared-types
- Remove local entity definitions
- Update type references

## Files Target
- packages/sdk/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-06-SDK-SYNTAX-ERROR-REMOVAL completed
- PHASE-02-SHARED-TYPES-BUILD-VALIDATION completed

## Implementation Steps
1. Audit SDK for local entity definitions
2. Import entities from shared-types
3. Remove local entity definitions
4. Update all type references
5. Verify TypeScript compiles
6. Document integration

## Deliverables
- Shared-types integration
- Removed local entities
- Integration report

## Verification
- All entities from shared-types
- No local entity definitions
- TypeScript compiles

## Expected Result
- SDK uses shared-types
- No entity duplication
- Canonical contracts