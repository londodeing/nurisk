# Task PHASE-01-ROOT-SCHEMA-REMOVAL

## Objective
Remove any Prisma schema definitions from root directory or non-canonical locations to enforce single source of truth.

## Scope
Remove duplicate/rogue schemas:
- Root directory schemas
- Package-level schemas
- Any schema not in backend/prisma/

## Files Target
- *.prisma (root)
- packages/*/*.prisma
- apps/*/*.prisma

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-SCHEMA-LOCATION-LOCK completed

## Implementation Steps
1. Search for all .prisma files in repository
2. Identify schemas not in backend/prisma/
3. Remove non-canonical schemas
4. Update any imports referencing removed schemas
5. Verify backend still has valid schema
6. Document removed files

## Deliverables
- Removed duplicate schema files
- Updated import references
- Removal audit log

## Verification
- Only backend/prisma/schema.prisma exists
- No broken imports
- Backend builds successfully

## Expected Result
- All duplicate schemas removed
- Single canonical schema remains
- No broken references