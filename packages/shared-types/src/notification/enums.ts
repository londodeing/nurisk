// Notification Enums

// =============================================================================
// Notification Type
// =============================================================================

export type NotificationType =
  | 'INCIDENT_REPORTED'      // New incident reported
  | 'INCIDENT_ASSIGNED'     // Incident assigned
  | 'INCIDENT_UPDATED'     // Incident status updated
  | 'INCIDENT_RESOLVED'    // Incident resolved
  | 'ASSESSMENT_REQUEST'  // Assessment requested
  | 'ASSESSMENT_COMPLETE' // Assessment completed
  | 'TEAM_DEPLOYED'      // Team deployed
  | 'TEAM_ARRIVED'      // Team arrived
  | 'MESSAGE_RECEIVED'  // New message
  | 'MENTION'          // Mentioned in chat
  | 'ALERT'           // System alert
  | 'WARNING'         // Warning
  | 'INFO';           // General info

// =============================================================================
// Notification Priority
// =============================================================================

export type NotificationPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

// =============================================================================
// Notification Channel
// =============================================================================

export type NotificationChannel =
  | 'IN_APP'      // In-app notification
  | 'PUSH'       // Push notification
  | 'SMS'        // SMS
  | 'EMAIL';     // Email