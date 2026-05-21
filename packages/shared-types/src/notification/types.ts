// Notification Types - Business Interfaces

import type { NotificationType, NotificationPriority, NotificationChannel } from './enums';

// =============================================================================
// Notification
// =============================================================================

export interface Notification {
  /** Notification ID */
  id: string;
  /** User ID */
  userId: string;
  /** Notification type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Message */
  message: string;
  /** Priority */
  priority: NotificationPriority;
  /** Related entity type */
  relatedEntityType?: string;
  /** Related entity ID */
  relatedEntityId?: string;
  /** Action URL */
  actionUrl?: string;
  /** Image URL */
  imageUrl?: string;
  /** Is read */
  isRead: boolean;
  /** Read at */
  readAt?: string;
  /** Created at */
  createdAt: string;
}

// =============================================================================
// Notification Preferences
// =============================================================================

export interface NotificationPreferences {
  /** User ID */
  userId: string;
  /** Enable in-app notifications */
  inAppEnabled: boolean;
  /** Enable push notifications */
  pushEnabled: boolean;
  /** Enable SMS */
  smsEnabled: boolean;
  /** Enable email */
  emailEnabled: boolean;
  /** Notification type settings */
  typeSettings: Record<NotificationType, NotificationTypeSetting>;
}

export interface NotificationTypeSetting {
  /** Enable for this type */
  enabled: boolean;
  /** Enable sound */
  sound: boolean;
  /** Enable vibration */
  vibration: boolean;
}

// =============================================================================
// Push Notification Payload
// =============================================================================

export interface PushNotificationPayload {
  /** Title */
  title: string;
  /** Body */
  body: string;
  /** Icon */
  icon?: string;
  /** Badge */
  badge?: string;
  /** Sound */
  sound?: string;
  /** Click action */
  clickAction?: string;
  /** Data */
  data?: Record<string, string>;
}

// =============================================================================
// Notification Filter
// =============================================================================

export interface NotificationFilter {
  /** Filter by type */
  type?: NotificationType;
  /** Filter by priority */
  priority?: NotificationPriority;
  /** Filter by read status */
  isRead?: boolean;
  /** Filter by date range */
  startDate?: string;
  /** End date */
  endDate?: string;
}

// =============================================================================
// Notification Statistics
// =============================================================================

export interface NotificationStatistics {
  /** Total notifications */
  total: number;
  /** Unread notifications */
  unread: number;
  /** By type */
  byType: Record<NotificationType, number>;
  /** By priority */
  byPriority: Record<NotificationPriority, number>;
}