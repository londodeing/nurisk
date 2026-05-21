// Notification Validation Schemas
import { z } from 'zod'

// Create notification schema
export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  type: z.enum([
    'INCIDENT_REPORTED',
    'INCIDENT_ASSIGNED',
    'INCIDENT_UPDATED',
    'INCIDENT_RESOLVED',
    'ASSESSMENT_REQUEST',
    'ASSESSMENT_COMPLETE',
    'TEAM_DEPLOYED',
    'TEAM_ARRIVED',
    'MESSAGE_RECEIVED',
    'MENTION',
    'ALERT',
    'WARNING',
    'INFO',
  ] as const),
  title: z.string().min(1, 'Title is required').max(100, 'Title must not exceed 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must not exceed 500 characters'),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).optional(),
  channel: z.enum(['IN_APP', 'PUSH', 'SMS', 'EMAIL'] as const).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

// Broadcast notification schema
export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  body: z.string().min(1, 'Isi wajib diisi'),
  target_role: z.string().optional(),
  target_region: z.string().optional(),
  incident_id: z.string().optional(),
})

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>

// Mark as read schema
export const markAsReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>

// Bulk mark as read schema
export const bulkMarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid('Invalid notification ID')).min(1, 'At least one notification ID is required'),
})

export type BulkMarkAsReadInput = z.infer<typeof bulkMarkAsReadSchema>