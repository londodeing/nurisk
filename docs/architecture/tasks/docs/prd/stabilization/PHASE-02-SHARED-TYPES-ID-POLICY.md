# Task PHASE-02-SHARED-TYPES-ID-POLICY

## Objective
Establish ID policy in shared-types enforcing UUID string as the only ID type.

## Scope
ID policy:
- EntityId type definition
- ID field conventions
- Type enforcement

## Files Target
- packages/shared-types/src/types/EntityId.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed
- PHASE-01-PRISMA-UUID-POLICY-LOCK completed

## Implementation Steps
1. Define EntityId type as string
2. Document UUID-only policy
3. Export from index.ts
4. Verify all entities use EntityId
5. Document ID policy for consumers

## Deliverables
- EntityId type
- ID policy documentation
- Enforcement guidelines

## Verification
- EntityId is string type
- All entities use EntityId
- Policy is documented

## Expected Result
- ID policy established
- UUID string enforced
- Foundation for PHASE-04 ID normalization