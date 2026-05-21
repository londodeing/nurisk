// Incident Validation Schemas
import { z } from 'zod'

// Helper to validate GeoJSON Point structure
const isValidGeoJSONPoint = (val: unknown): val is { type: 'Point'; coordinates: [number, number] } => {
  return (
    val !== null &&
    typeof val === 'object' &&
    (val as any).type === 'Point' &&
    Array.isArray((val as any).coordinates) &&
    (val as any).coordinates.length === 2 &&
    typeof (val as any).coordinates[0] === 'number' &&
    typeof (val as any).coordinates[1] === 'number' &&
    // Validate latitude (-90 to 90) and longitude (-180 to 180)
    (val as any).coordinates[1] >= -90 &&
    (val as any).coordinates[1] <= 90 &&
    (val as any).coordinates[0] >= -180 &&
    (val as any).coordinates[0] <= 180
  )
}

// Create incident schema
export const createIncidentSchema = z.object({
  incidentCode: z.string().min(1, 'Incident code is required').max(50, 'Incident code must not exceed 50 characters'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  disasterType: z.enum([
    'BANJIR',
    'LONGSOR',
    'GEMPA',
    'TSUNAMI',
    'VOLKANO',
    'KEBAKARAN_HUTAN',
    'KEBAKARAN_BANGUNAN',
    'EKSTREM_CUACA',
    'WABAH_PENYAKIT',
  ] as const, { message: 'Invalid disaster type' }),
  status: z.enum([
    'REPORTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ] as const, { message: 'Invalid incident status' }).optional(),
  location: z.custom(isValidGeoJSONPoint, 'Location must be a valid GeoJSON Point with valid coordinates'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  kecamatan: z.string().min(1, 'Kecamatan is required').max(100, 'Kecamatan must not exceed 100 characters'),
  desa: z.string().min(1, 'Desa is required').max(100, 'Desa must not exceed 100 characters'),
  specificAddress: z.string().max(500, 'Specific address must not exceed 500 characters').optional(),
  priorityScore: z.number().min(0, 'Priority score must be at least 0').max(100, 'Priority score must not exceed 100').optional(),
  priorityLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  currentCondition: z.string().max(500, 'Current condition must not exceed 500 characters').optional(),
  reporterName: z.string().min(1, 'Reporter name is required').max(100, 'Reporter name must not exceed 100 characters'),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 characters').max(20, 'WhatsApp number must not exceed 20 characters'),
  photoData: z.string().optional(),
  eventDate: z.string().datetime({ message: 'Invalid event date format' }),
  probabilityScore: z.number().min(0, 'Probability score must be at least 0').max(100, 'Probability score must not exceed 100').optional(),
  source: z.enum(['sensor', 'manual_report', 'social_media', 'emergency_call', 'other'] as const).optional(),
})

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>

// Update incident schema (partial update)
export const updateIncidentSchema = createIncidentSchema.partial().extend({
  id: z.string().uuid('Invalid incident ID'),
})

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>

// Incident filter query schema
export const incidentFilterSchema = z.object({
  disasterType: z.enum([
    'BANJIR',
    'LONGSOR',
    'GEMPA',
    'TSUNAMI',
    'VOLKANO',
    'KEBAKARAN_HUTAN',
    'KEBAKARAN_BANGUNAN',
    'EKSTREM_CUACA',
    'WABAH_PENYAKIT',
  ] as const).optional(),
  status: z.enum([
    'REPORTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ] as const).optional(),
  priorityLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).optional(),
  region: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type IncidentFilterInput = z.infer<typeof incidentFilterSchema>