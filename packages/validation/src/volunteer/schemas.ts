// Volunteer Validation Schemas
import { z } from 'zod'

// Create volunteer schema
export const createVolunteerSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must not exceed 100 characters'),
  email: z.string().email('Invalid email format').optional(),
  phoneNumber: z.string().min(10, 'Phone number is required').max(20, 'Phone number must not exceed 20 characters'),
  status: z.enum(['ACTIVE', 'DEPLOYED', 'ON_DUTY', 'OFF_DUTY', 'INACTIVE'] as const).optional(),
  volunteerType: z.enum(['RELAWAN_PBNU', 'RELAWAN_PCNU', 'RELAWAN_CABANG', 'RELAWAN_DESA'] as const).optional(),
  skills: z.array(z.enum([
    'FIRST_AID',
    'SEARCH_RESCUE',
    'MEDICAL',
    'LOGISTICS',
    'COMMUNICATION',
    'DRIVING',
    'COORDINATION',
    'EVACUATION',
    'SHELTER_MANAGEMENT',
    'WATER_RESCUE',
  ] as const)).optional(),
  branch: z.enum(['headquarters', 'regional', 'local', 'field'] as const).optional(),
  rank: z.enum(['trainee', 'junior', 'senior', 'lead', 'commander'] as const).optional(),
  isAvailable: z.boolean().optional(),
})

export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>

// Update volunteer schema
export const updateVolunteerSchema = createVolunteerSchema.partial().extend({
  id: z.string().uuid('Invalid volunteer ID'),
})

export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>

// Create team schema
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must not exceed 100 characters'),
  teamType: z.enum(['RESPONSE', 'MEDICAL', 'LOGISTICS', 'SEARCH', 'EVACUATION', 'ASSESSMENT', 'COORDINATION'] as const),
  status: z.enum(['ACTIVE', 'DEPLOYED', 'STANDBY', 'INACTIVE'] as const).optional(),
  leaderId: z.string().uuid('Invalid leader ID'),
  memberIds: z.array(z.string().uuid('Invalid member ID')).optional(),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
  region: z.string().max(100, 'Region must not exceed 100 characters').optional(),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>

// Update team schema
export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string().uuid('Invalid team ID'),
})

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

// Team assignment schema
export const assignTeamSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
  incidentId: z.string().uuid('Invalid incident ID'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
})

export type AssignTeamInput = z.infer<typeof assignTeamSchema>

// Volunteer check-in schema
export const checkInSchema = z.object({
  volunteerId: z.string().uuid('Invalid volunteer ID'),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  status: z.enum(['ARRIVED', 'DEPARTED', 'STATUS_UPDATE'] as const),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
})

export type CheckInInput = z.infer<typeof checkInSchema>

// Deploy volunteer schema
export const deployVolunteerSchema = z.object({
  volunteer_id: z.string().min(1, 'ID volunteer wajib diisi'),
  incident_id: z.string().min(1, 'ID incident wajib diisi'),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  note: z.string().optional(),
})

export type DeployVolunteerInput = z.infer<typeof deployVolunteerSchema>