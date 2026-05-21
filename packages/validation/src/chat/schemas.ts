// Chat Validation Schemas
import { z } from 'zod'

// Create conversation schema
export const createConversationSchema = z.object({
  name: z.string().max(100, 'Conversation name must not exceed 100 characters').optional(),
  type: z.enum(['DIRECT', 'INCIDENT', 'TEAM', 'BROADCAST'] as const),
  participantIds: z.array(z.string().uuid('Invalid participant ID')).min(1, 'At least one participant is required'),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>

// Send message schema
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'] as const),
  content: z.string().min(1, 'Message content is required'),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }).optional(),
  mediaUrl: z.string().url('Invalid media URL').optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

// Update conversation schema
export const updateConversationSchema = z.object({
  id: z.string().uuid('Invalid conversation ID'),
  name: z.string().max(100, 'Conversation name must not exceed 100 characters').optional(),
})

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>

// Add participant schema
export const addParticipantSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER'] as const).optional(),
})

export type AddParticipantInput = z.infer<typeof addParticipantSchema>

// Chat broadcast schema
export const broadcastSchema = z.object({
  region: z.string().min(1, 'Region wajib diisi'),
  message: z.string().min(1, 'Pesan wajib diisi'),
  target_role: z.string().optional(),
})

export type BroadcastInput = z.infer<typeof broadcastSchema>