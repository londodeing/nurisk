import { z } from 'zod';

// Mission status
const missionStatusEnum = ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

// Deployment status
const deploymentStatusEnum = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'RECALLED'] as const;

// Create Mission DTO
export const createMissionSchema = z.object({
  incident_id: z.number().int().positive('Invalid incident_id'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  
  // Location
  location: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Timing
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  
  // Requirements
  required_skills: z.string().max(500).optional(),
  capacity: z.number().int().positive().max(100).default(10),
  
  // Status
  status: z.enum(missionStatusEnum).default('DRAFT')
});

// Update Mission DTO
export const updateMissionSchema = createMissionSchema.partial();

// Filter Mission Query
export const missionFilterSchema = z.object({
  incident_id: z.number().int().positive().optional(),
  status: z.enum(missionStatusEnum).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// Deploy Volunteer DTO
export const deployVolunteerSchema = z.object({
  volunteer_id: z.number().int().positive('Invalid volunteer_id'),
  role: z.string().max(100).optional(),
  note: z.string().max(500).optional()
});

// Types
export type CreateMissionDTO = z.infer<typeof createMissionSchema>;
export type UpdateMissionDTO = z.infer<typeof updateMissionSchema>;
export type MissionFilterDTO = z.infer<typeof missionFilterSchema>;
export type DeployVolunteerDTO = z.infer<typeof deployVolunteerSchema>;