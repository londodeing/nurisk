// Conversation Entity - Canonical Contract

import type { BaseEntity } from '../common/entity';
import type { ConversationType, ConversationMemberRole } from '../chat/enums';

export interface Conversation extends BaseEntity {
  /** Conversation type */
  type: ConversationType;
  /** Name (for group chats) */
  name?: string;
  /** Description */
  description?: string;
  /** Avatar URL */
  avatar?: string;
  /** Incident ID (for incident chats) */
  incidentId?: string;
  /** Team ID (for team chats) */
  teamId?: string;
  /** Last message ID */
  lastMessageId?: string;
  /** Last message content snippet */
  lastMessageSnippet?: string;
  /** Last message sender ID */
  lastMessageSenderId?: string;
  /** Last message time */
  lastMessageAt?: string;
  /** Number of unread messages */
  unreadCount: number;
  /** Number of members */
  memberCount: number;
  /** Created by user ID */
  createdBy: string;
}

export interface ConversationMember extends BaseEntity {
  /** Conversation ID */
  conversationId: string;
  /** User ID */
  userId: string;
  /** User name */
  userName: string;
  /** User avatar */
  userAvatar?: string;
  /** Role in conversation */
  role: ConversationMemberRole;
  /** Last read message ID */
  lastReadMessageId?: string;
  /** Last read at */
  lastReadAt?: string;
  /** Is muted */
  isMuted: boolean;
  /** Is pinned */
  isPinned: boolean;
}
