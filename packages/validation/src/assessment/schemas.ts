// Assessment Validation Schemas
import { z } from 'zod'

// Create assessment schema
export const createAssessmentSchema = z.object({
  incidentId: z.string().uuid('Invalid incident ID'),
  assessmentType: z.enum(['INITIAL', 'DETAILED', 'FOLLOW_UP'] as const),
  status: z.enum(['DRAFT', 'SUBMITTED', 'VERIFIED', 'APPROVED'] as const).optional(),
  damageLevel: z.enum(['TOTAL', 'HEAVY', 'MEDIUM', 'LIGHT'] as const).optional(),
  impactCategory: z.enum(['CASUALTIES', 'INFRASTRUCTURE', 'ECONOMIC', 'ENVIRONMENT'] as const).optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  affectedPopulation: z.number().int().min(0, 'Affected population cannot be negative').optional(),
  damagedBuildings: z.number().int().min(0, 'Damaged buildings cannot be negative').optional(),
  damagedInfrastructure: z.number().int().min(0, 'Damaged infrastructure cannot be negative').optional(),
  economicLoss: z.number().min(0, 'Economic loss cannot be negative').optional(),
  casualties: z.number().int().min(0, 'Casualties cannot be negative').optional(),
  injuries: z.number().int().min(0, 'Injuries cannot be negative').optional(),
  missing: z.number().int().min(0, 'Missing cannot be negative').optional(),
  evacuated: z.number().int().min(0, 'Evacuated cannot be negative').optional(),
  assessorName: z.string().min(1, 'Assessor name is required').max(100, 'Assessor name must not exceed 100 characters'),
  assessorContact: z.string().min(10, 'Assessor contact is required').max(20, 'Assessor contact must not exceed 20 characters'),
  photos: z.array(z.string()).optional(),
  recommendations: z.string().max(1000, 'Recommendations must not exceed 1000 characters').optional(),
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>

// Update assessment schema
export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  id: z.string().uuid('Invalid assessment ID'),
})

export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>

// Damage report schema
export const damageReportSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID'),
  damageType: z.enum(['BUILDING', 'INFRASTRUCTURE', 'AGRICULTURE', 'LIVESTOCK', 'PUBLIC_FACILITY'] as const),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  description: z.string().max(500, 'Description must not exceed 500 characters'),
  severity: z.enum(['TOTAL', 'HEAVY', 'MEDIUM', 'LIGHT'] as const),
  estimatedLoss: z.number().min(0, 'Estimated loss cannot be negative').optional(),
  photos: z.array(z.string()).optional(),
})

export type DamageReportInput = z.infer<typeof damageReportSchema>