# Task PHASE-02-SHARED-TYPES-DATE-SERIALIZATION-POLICY

## Objective
Establish date serialization policy in shared-types ensuring all dates are ISO-8601 strings in transport.

## Scope
Date serialization:
- Date field types
- Serialization format
- Type definitions

## Files Target
- packages/shared-types/src/types/DateTypes.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Define ISODateString type
2. Document serialization policy
3. Add date type aliases
4. Export from index.ts
5. Verify TypeScript compiles
6. Document policy for consumers

## Deliverables
- ISODateString type
- Date serialization policy
- Documentation

## Verification
- Date types are string only
- Policy is documented
- All entities use consistent date types

## Expected Result
- Date serialization policy established
- All dates are ISO strings
- Foundation for PHASE-06 serialization stabilization