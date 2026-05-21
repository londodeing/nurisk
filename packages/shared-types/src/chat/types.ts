// Chat Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { ConversationType, MessageType, MessageStatus, ConversationMemberRole } from './enums';

// =============================================================================
// Conversation
// =============================================================================

export interface Conversation {
  /** Conversation ID */
  id: string;
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
  /** Incident title (UI enrichment - derived from incident relation) */
  incidentTitle?: string;
  /** Team ID (for team chats) */
  teamId?: string;
  /** Last message */
  lastMessage?: Message;
  /** Last message snippet */
  lastMessageSnippet?: string;
  /** Last message time */
  lastMessageAt?: string;
  /** Number of unread messages */
  unreadCount?: number;
  /** Number of members (optional - backend may calculate) */
  memberCount?: number;
  /** Participants (members in conversation) */
  participants?: ChatUser[];
  /** Created by user ID (optional - backend may not provide) */
  createdBy?: string;
  /** Created at */
  createdAt?: string;
  /** Updated at (optional - backend may not provide) */
  updatedAt?: string;
}

// =============================================================================
// Message
// =============================================================================

export interface Message {
  /** Message ID */
  id: string;
  /** Conversation ID */
  conversationId: string;
  /** Sender user ID */
  senderId: string;
  /** Sender name */
  senderName?: string;
  /** Sender avatar */
  senderAvatar?: string;
  /** Message type */
  type: MessageType;
  /** Message content (canonical - matches Prisma) */
  message: string;
  /** Media URL (for image/video/file) */
  mediaUrl?: string;
  /** Media thumbnail */
  thumbnail?: string;
  /** File name (for file) */
  fileName?: string;
  /** File size (for file) */
  fileSize?: number;
  /** Location (for location) */
  location?: GeoLocation;
  /** Reply to message ID */
  replyTo?: string;
  /** Read by user IDs */
  readBy?: string[];
  /** Status (optional - backend may not provide) */
  status?: MessageStatus;
  /** Created at */
  createdAt: string;
  /** Read at (optional) */
  readAt?: string;
}

// =============================================================================
// Chat User
// =============================================================================

export interface ChatUser {
  /** User ID */
  id: string;
  /** User name */
  name: string;
  /** User role/title */
  role?: string;
  /** User avatar */
  avatar?: string;
  /** Is online */
  isOnline?: boolean;
  /** Last seen */
  lastSeen?: string;
}

// =============================================================================
// Conversation Member
// =============================================================================

export interface ConversationMember {
  /** Member ID */
  id: string;
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
  /** Joined at */
  joinedAt: string;
  /** Last read message ID */
  lastReadMessageId?: string;
  /** Last read at */
  lastReadAt?: string;
  /** Is muted */
  isMuted: boolean;
  /** Is pinned */
  isPinned: boolean;
}

// =============================================================================
// Chat Filter
// =============================================================================

export interface ChatFilter {
  /** Filter by type */
  type?: ConversationType;
  /** Filter by incident ID */
  incidentId?: string;
  /** Filter by team ID */
  teamId?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Send Message Request
// =============================================================================

export interface SendMessageRequest {
  /** Message type */
  type: MessageType;
  /** Message content (canonical - matches Prisma) */
  message: string;
  /** Media URL (optional) */
  mediaUrl?: string;
  /** Reply to message ID (optional) */
  replyTo?: string;
}

// =============================================================================
// Typing Indicator
// =============================================================================

export interface TypingIndicator {
  /** Conversation ID */
  conversationId: string;
  /** User ID */
  userId: string;
  /** User name */
  userName: string;
  /** Is typing */
  isTyping: boolean;
}

// =============================================================================
// Online Status
// =============================================================================

export interface OnlineStatus {
  /** User ID */
  userId: string;
  /** Is online */
  isOnline: boolean;
  /** Last seen */
  lastSeen?: string;
}