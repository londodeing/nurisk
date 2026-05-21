# Task PHASE-02-SHARED-TYPES-CANONICALIZATION

## Objective
Establish shared-types as the canonical source for all entity contracts, consolidating type definitions from multiple locations.

## Scope
Canonicalize shared-types:
- Entity interfaces
- Type definitions
- Export patterns
- Directory structure

## Files Target
- packages/shared-types/src/**/*.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-CANONICALIZATION completed

## Implementation Steps
1. Audit current shared-types structure
2. Identify all entity types
3. Verify export patterns
4. Check for duplicate definitions
5. Consolidate entity definitions
6. Standardize export structure
7. Document canonical types

## Deliverables
- Canonical shared-types structure
- Entity consolidation report
- Export pattern standardization

## Verification
- All entities in shared-types
- Consistent export patterns
- No duplicate definitions

## Expected Result
- shared-types is canonical owner
- All entities consolidated
- Foundation for PHASE-02 subsequent tasks