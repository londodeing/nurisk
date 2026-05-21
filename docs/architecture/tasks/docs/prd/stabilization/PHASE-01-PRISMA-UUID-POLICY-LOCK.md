# Task PHASE-01-PRISMA-UUID-POLICY-LOCK

## Objective
Enforce UUID string as the only ID type across all Prisma models, eliminating any numeric or other ID types.

## Scope
Lock UUID policy:
- All @id fields must be String (UUID)
- No @db.Uuid alternatives
- No auto-increment fields

## Files Target
- backend/prisma/schema.prisma

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-01-PRISMA-CANONICALIZATION completed

## Implementation Steps
1. Read Prisma schema
2. List all @id field definitions
3. Identify any non-UUID ID fields
4. Convert any numeric IDs to UUID strings
5. Remove any auto-increment configurations
6. Verify all IDs are now UUID strings
7. Document UUID policy enforcement

## Deliverables
- UUID policy enforced
- Converted ID fields documented
- Policy documentation

## Verification
- All @id fields are String type
- No @default(uuid()) missing
- Schema validates successfully

## Expected Result
- All models use UUID string IDs
- No numeric IDs remain
- Foundation for PHASE-04 ID normalization