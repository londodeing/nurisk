# Task PHASE-01-PRISMA-SCHEMA-LOCATION-LOCK

## Objective
Ensure Prisma schema is located in the canonical location and all packages reference it consistently.

## Scope
Lock Prisma schema location:
- Verify schema is in backend/prisma/schema.prisma
- Ensure no duplicate schemas exist
- Verify schema accessibility

## Files Target
- backend/prisma/schema.prisma
- packages/*/prisma/
- apps/*/prisma/

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-CANONICALIZATION completed

## Implementation Steps
1. Verify backend/prisma/schema.prisma exists
2. Search for any other schema.prisma files
3. Remove any duplicate schemas found
4. Verify schema is accessible to backend
5. Document canonical schema location
6. Update any references to old locations

## Deliverables
- Single canonical Prisma schema location
- Removal of duplicate schemas
- Reference update documentation

## Verification
- Only one schema.prisma exists
- Located at backend/prisma/schema.prisma
- No broken references to schema

## Expected Result
- Prisma schema location is locked
- No duplicate schemas exist
- All references point to canonical location