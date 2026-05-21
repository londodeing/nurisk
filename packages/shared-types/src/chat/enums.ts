// Chat Enums

// =============================================================================
// Conversation Type
// =============================================================================

export type ConversationType =
  | 'DIRECT'        // Direct message
  | 'INCIDENT'      // Incident group
  | 'TEAM'         // Team group
  | 'BROADCAST';   // Broadcast message

// =============================================================================
// Message Type
// =============================================================================

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'FILE'
  | 'SYSTEM'

// =============================================================================
// Message Status
// =============================================================================

export type MessageStatus =
  | 'SENDING'    // Sending
  | 'SENT'       // Sent
  | 'DELIVERED'   // Delivered
  | 'READ'       // Read
  | 'FAILED';    // Failed

// =============================================================================
// Conversation Member Role
// =============================================================================

export type ConversationMemberRole =
  | 'ADMIN'       // Admin
  | 'MODERATOR'  // Moderator
  | 'MEMBER';    // Regular member