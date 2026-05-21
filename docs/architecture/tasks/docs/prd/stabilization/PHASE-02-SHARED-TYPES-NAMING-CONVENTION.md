# Task PHASE-02-SHARED-TYPES-NAMING-CONVENTION

## Objective
Establish naming convention policy in shared-types enforcing camelCase for all type names and properties.

## Scope
Naming conventions:
- Type names (PascalCase)
- Property names (camelCase)
- Enum member names (UPPER_SNAKE_CASE)
- Export naming

## Files Target
- packages/shared-types/src/
- docs/architecture/NAMING-CONVENTIONS.md

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-CANONICALIZATION completed

## Implementation Steps
1. Document naming conventions
2. Create NAMING-CONVENTIONS.md
3. Audit existing types for violations
4. Fix any naming violations
5. Verify TypeScript compiles
6. Publish convention documentation

## Deliverables
- NAMING-CONVENTIONS.md
- Naming audit report
- Fixed violations

## Verification
- All types follow conventions
- NAMING-CONVENTIONS.md is published
- No naming violations

## Expected Result
- Naming conventions established
- Consistent naming across types
- Foundation for governance enforcement