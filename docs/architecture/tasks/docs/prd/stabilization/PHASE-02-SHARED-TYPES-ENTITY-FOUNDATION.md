# Task PHASE-02-SHARED-TYPES-ENTITY-FOUNDATION

## Objective
Create the foundational entity structure in shared-types for all domain entities.

## Scope
Foundation entities:
- Base entity interface
- Entity ID type
- Common entity properties
- Timestamp types

## Files Target
- packages/shared-types/src/entities/
- packages/shared-types/src/base/

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Create base entity interface
2. Define EntityId type (UUID string)
3. Create timestamp interfaces
4. Add common entity properties
5. Export foundation types
6. Document foundation patterns

## Deliverables
- Base entity interface
- EntityId type definition
- Timestamp interfaces
- Foundation documentation

## Verification
- Foundation types are exported
- All entities extend base
- TypeScript compiles

## Expected Result
- Consistent entity foundation
- All entities share base
- Foundation for entity tasks