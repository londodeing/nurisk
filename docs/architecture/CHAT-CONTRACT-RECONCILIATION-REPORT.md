# CHAT CONTRACT RECONCILIATION REPORT

**Task ID**: PHASE-02-SHARED-TYPES-CHAT-CONTRACT-RECONCILIATION  
**Date**: 2026-05-20  
**Status**: COMPLETE

---

## EXECUTIVE SUMMARY

This report documents the canonical contract reconciliation between frontend-web, shared-types, SDK, and backend chat entities. The audit reveals that most contracts already exist in shared-types with correct naming. The primary drift is in the `entities/Message.ts` which uses `content` instead of the canonical `message`.

---

## AUDITED FILES

### Frontend-Web (Local Types)
| File | Purpose |
|------|---------|
| `frontend-web/src/hooks/use-chat.ts` | Primary chat hooks and types |
| `frontend-web/src/stores/use-chat-store.ts` | Zustand store (snake_case) |
| `frontend-web/src/components/chat/MessageBubble.tsx` | Message renderer |
| `frontend-web/src/components/chat/TypingIndicator.tsx` | Typing display |
| `frontend-web/src/components/chat/ConversationList.tsx` | Conversation list |

### Shared-Types (Canonical)
| File | Purpose |
|------|---------|
| `packages/shared-types/src/chat/types.ts` | Chat business interfaces |
| `packages/shared-types/src/chat/index.ts` | Chat exports |
| `packages/shared-types/src/chat/enums.ts` | Chat enums |
| `packages/shared-types/src/entities/Message.ts` | Message entity |
| `packages/shared-types/src/entities/ChatUser.ts` | ChatUser entity |
| `packages/shared-types/src/entities/Conversation.ts` | Conversation entity |

### SDK (Transport)
| File | Purpose |
|------|---------|
| `packages/sdk/src/chat/index.ts` | Chat API client |
| `packages/sdk/src/index.ts` | SDK exports |

### Backend (Runtime)
| File | Purpose |
|------|---------|
| `backend/src/chat/chat.service.ts` | Chat service |
| `backend/src/chat/chat.controller.ts` | REST endpoints |
| `backend/src/chat/chat.repository.ts` | Data access |
| `backend/src/gateway/gateway.gateway.ts` | WebSocket gateway |

---

## FIELD MISMATCH ANALYSIS

### 1. ChatUser.role

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `role` | `string` | Local type |
| shared-types (chat/types.ts) | `role?` | `string` | ✅ CANONICAL |
| shared-types (entities/ChatUser.ts) | `role?` | `string` | ✅ CANONICAL |

**Classification**: CANONICAL  
**Decision**: Already exists in shared-types. Frontend should import from `@nurisk/shared-types/chat`.

---

### 2. Message.message vs Message.content

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `message` | `string` | Local type |
| shared-types (chat/types.ts) | `message` | `string` | ✅ CANONICAL |
| shared-types (entities/Message.ts) | `content` | `string` | ❌ DRIFT |
| backend (Prisma) | `message` | `string` | Runtime |

**Classification**: CANONICAL  
**Decision**: Use `message` (matches backend Prisma). Fix `entities/Message.ts` to use `message`.

---

### 3. Message.attachmentUrl / attachmentName

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `attachmentUrl?` | `string` | Local type |
| frontend-web (use-chat.ts) | `attachmentName?` | `string` | Local type |
| shared-types (chat/types.ts) | `mediaUrl?` | `string` | Different naming |
| shared-types (chat/types.ts) | `fileName?` | `string` | Different naming |

**Classification**: CANONICAL  
**Decision**: Use `mediaUrl` and `fileName` (already in shared-types). Frontend uses legacy naming.

---

### 4. Conversation.incidentTitle

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `incidentTitle?` | `string` | Local type |
| shared-types (chat/types.ts) | `incidentTitle?` | `string` | ✅ CANONICAL |

**Classification**: CANONICAL  
**Decision**: Already exists in shared-types. Marked as "UI enrichment - derived from incident relation".

---

### 5. Conversation.participants

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `participants?` | `ChatUser[]` | Local type |
| shared-types (chat/types.ts) | `participants?` | `ChatUser[]` | ✅ CANONICAL |

**Classification**: CANONICAL  
**Decision**: Already exists in shared-types.

---

### 6. TypingIndicator

| Location | Field | Type | Status |
|----------|-------|------|--------|
| frontend-web (use-chat.ts) | `TypingUser` | `timestamp: number` | Local type |
| shared-types (chat/types.ts) | `TypingIndicator` | `isTyping: boolean` | ✅ CANONICAL |
| backend (gateway.gateway.ts) | `chat.conversation.typing` | `{ userId }` | Socket event |

**Classification**:
- `TypingIndicator.isTyping` = CANONICAL (transport state)
- `TypingUser.timestamp` = UI_ONLY (frontend state for animation)

**Decision**: Keep both - they serve different purposes. `TypingIndicator` is transport, `TypingUser` is UI state.

---

## CLASSIFICATION MATRIX

| Field | Frontend | Shared-Types | Backend | Classification | Decision |
|-------|---------|-------------|---------|--------------|----------|
| `role` | `string` | `role?: string` | - | CANONICAL | Use shared-types |
| `message` | `message: string` | `message: string` | `message` | CANONICAL | Use `message` |
| `content` | - | `content: string` | - | INVALID | Remove from entities |
| `attachmentUrl` | `string` | `mediaUrl` | - | LEGACY | Use `mediaUrl` |
| `attachmentName` | `string` | `fileName` | - | LEGACY | Use `fileName` |
| `incidentTitle` | `string` | `string` | - | CANONICAL | Use shared-types |
| `participants` | `ChatUser[]` | `ChatUser[]` | - | CANONICAL | Use shared-types |
| `TypingUser.timestamp` | `number` | - | - | UI_ONLY | Keep locally |
| `TypingIndicator.isTyping` | - | `boolean` | - | CANONICAL | Use shared-types |

---

## CANONICAL DECISION TABLE

### Message Contract
```typescript
// Canonical in shared-types/chat/types.ts (CORRECT)
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: MessageType;
  message: string;           // ✅ CANONICAL (matches backend)
  mediaUrl?: string;         // ✅ CANONICAL
  fileName?: string;         // ✅ CANONICAL
  // ...other fields
}
```

### Fix Required: entities/Message.ts
```typescript
// CURRENT (WRONG)
content: string

// SHOULD BE
message: string
```

### ChatUser Contract
```typescript
// Canonical in shared-types/chat/types.ts (CORRECT)
export interface ChatUser {
  id: string;
  name: string;
  role?: string;           // ✅ CANONICAL
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}
```

### TypingIndicator Contract
```typescript
// Canonical in shared-types/chat/types.ts (CORRECT)
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;       // ✅ CANONICAL (transport state)
}
```

---

## MIGRATION IMPACT

### Frontend Changes Required
1. Import `ChatUser`, `Message`, `Conversation`, `TypingIndicator` from `@nurisk/shared-types/chat`
2. Remove local type definitions
3. Update field references:
   - `message.attachmentUrl` → `message.mediaUrl`
   - `message.attachmentName` → `message.fileName`
4. Keep `TypingUser` locally for UI state (timestamp for animation)

### Shared-Types Changes Required
1. Fix `entities/Message.ts`: `content` → `message`
2. Export `TypingIndicator` from entities (if needed)

### SDK Changes Required
1. None - already uses correct canonical types

### Backend Changes Required
1. None - already uses correct naming

---

## REJECTED FIELDS

| Field | Reason |
|-------|--------|
| `Message.content` | Duplicate of `message`, causes confusion |
| `Message.attachmentUrl` | Legacy naming, use `mediaUrl` |
| `Message.attachmentName` | Legacy naming, use `fileName` |

---

## ACCEPTED FIELDS

All canonical fields in `shared-types/chat/types.ts` are accepted.

---

## VALIDATION COMMANDS

```bash
pnpm --filter @nurisk/shared-types build
pnpm --filter @nurisk/sdk build
pnpm --filter frontend-web typecheck
pnpm --filter frontend-web build
```

---

## SUCCESS CRITERIA

- [x] Canonical chat contracts documented
- [x] Field mismatches identified and classified
- [x] Classification matrix complete
- [x] Canonical decision table complete
- [x] Migration impact documented
- [x] Rejected fields documented
- [x] Accepted fields documented