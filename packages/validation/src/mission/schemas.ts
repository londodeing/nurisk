// Mission Validation Schemas
import { z } from 'zod'
import { geoLocationSchema } from '../common'

// Create mission schema
export const createMissionSchema = z.object({
  incidentId: z.string().uuid('Invalid incident ID'),
  name: z.string().min(1, 'Mission name is required').max(200, 'Mission name must not exceed 200 characters'),
  type: z.enum(['RECONNAISSANCE', 'SUPPLY', 'EVACUATION', 'COMBAT_SUPPORT'] as const, { message: 'Invalid mission type' }),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const, { message: 'Invalid priority' }),
  location: geoLocationSchema,
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  startedAt: z.string().datetime({ message: 'Invalid start date' }).optional(),
})

export type CreateMissionInput = z.infer<typeof createMissionSchema>

// Update mission schema (partial update)
export const updateMissionSchema = createMissionSchema.partial().extend({
  id: z.string().uuid('Invalid mission ID'),
})

export type UpdateMissionInput = z.infer<typeof updateMissionSchema>

// Mission assignment schema
export const missionAssignmentSchema = z.object({
  missionId: z.string().uuid('Invalid mission ID'),
  assigneeId: z.string().uuid('Invalid assignee ID'),
  assigneeName: z.string().max(100).optional(),
  role: z.string().min(1, 'Role is required').max(100, 'Role must not exceed 100 characters'),
})

export type MissionAssignmentInput = z.infer<typeof missionAssignmentSchema>

// Mission report schema
export const missionReportSchema = z.object({
  missionId: z.string().uuid('Invalid mission ID'),
  summary: z.string().min(1, 'Summary is required').max(2000, 'Summary must not exceed 2000 characters'),
  findings: z.array(z.string().min(1)).min(1, 'At least one finding is required'),
  recommendations: z.array(z.string().min(1)).optional(),
  reportedBy: z.string().uuid('Invalid reporter ID'),
  reportedByName: z.string().max(100).optional(),
})

export type MissionReportInput = z.infer<typeof missionReportSchema>
