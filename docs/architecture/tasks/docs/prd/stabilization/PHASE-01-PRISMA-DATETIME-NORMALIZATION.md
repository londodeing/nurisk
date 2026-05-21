# Task PHASE-01-PRISMA-DATETIME-NORMALIZATION

## Objective
Normalize all datetime fields in Prisma to use consistent DateTime handling without timezone inconsistencies.

## Scope
Normalize datetime:
- @db.DateTime fields
- @db.Timestamp fields
- DateTime defaults
- Timezone handling

## Files Target
- backend/prisma/schema.prisma

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-CANONICALIZATION completed

## Implementation Steps
1. Read Prisma schema
2. List all datetime field types
3. Standardize to @db.Timestamp
4. Verify default values use now()
5. Document datetime policy
6. Ensure consistent timezone handling

## Deliverables
- Normalized datetime fields
- Datetime policy documentation
- Conversion report

## Verification
- All datetime fields use consistent type
- Defaults are set correctly
- Schema validates

## Expected Result
- Consistent datetime handling
- No mixed datetime types
- Foundation for PHASE-02 date serialization