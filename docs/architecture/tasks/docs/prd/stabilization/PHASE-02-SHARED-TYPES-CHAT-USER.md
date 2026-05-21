# Task PHASE-02-SHARED-TYPES-CHAT-USER

## Objective
Add ChatUser entity to shared-types as a canonical contract.

## Scope
ChatUser entity:
- Interface definition
- Required fields
- Optional fields
- Export

## Files Target
- packages/shared-types/src/entities/ChatUser.ts
- packages/shared-types/src/index.ts

## Preconditions
- PHASE-00-BASELINE-FREEZE is declared
- PHASE-02-SHARED-TYPES-ENTITY-FOUNDATION completed

## Implementation Steps
1. Define ChatUser interface
2. Include all required fields
3. Add optional metadata fields
4. Export from index.ts
5. Verify TypeScript compiles
6. Document ChatUser entity

## Deliverables
- ChatUser interface
- Export added
- Documentation

## Verification
- ChatUser interface is valid TypeScript
- Exported from shared-types
- No duplicate ChatUser definition

## Expected Result
- ChatUser entity in shared-types
- Canonical contract established
- Ready for migration