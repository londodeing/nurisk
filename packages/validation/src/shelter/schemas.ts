// Shelter Validation Schemas
import { z } from 'zod'

// Create shelter schema
export const createShelterSchema = z.object({
  name: z.string().min(1, 'Shelter name is required').max(100, 'Shelter name must not exceed 100 characters'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters'),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  refugeeCount: z.number().int().min(0, 'Refugee count cannot be negative').optional(),
  waterStockLiters: z.number().int().min(0, 'Water stock cannot be negative').optional(),
  toiletCount: z.number().int().min(0, 'Toilet count cannot be negative').optional(),
  status: z.enum(['AKTIF', 'FULL', 'CLOSED'] as const).optional(),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must not exceed 100').optional(),
  stockStatus: z.string().max(50, 'Stock status must not exceed 50 characters').optional(),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
}).refine((data) => {
  // Ensure refugee count does not exceed capacity
  if (data.refugeeCount !== undefined && data.capacity !== undefined) {
    return data.refugeeCount <= data.capacity
  }
  return true
}, {
  message: "Refugee count cannot exceed shelter capacity",
  path: ["refugeeCount"],
})

export type CreateShelterInput = z.infer<typeof createShelterSchema>

// Update shelter schema
export const updateShelterSchema = z.object({
  id: z.string().uuid('Invalid shelter ID'),
  name: z.string().min(1, 'Shelter name is required').max(100, 'Shelter name must not exceed 100 characters').optional(),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters').optional(),
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters').optional(),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }).optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  refugeeCount: z.number().int().min(0, 'Refugee count cannot be negative').optional(),
  waterStockLiters: z.number().int().min(0, 'Water stock cannot be negative').optional(),
  toiletCount: z.number().int().min(0, 'Toilet count cannot be negative').optional(),
  status: z.enum(['AKTIF', 'FULL', 'CLOSED'] as const).optional(),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must not exceed 100').optional(),
  stockStatus: z.string().max(50, 'Stock status must not exceed 50 characters').optional(),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
})

export type UpdateShelterInput = z.infer<typeof updateShelterSchema>

// Shelter capacity status schema
export const shelterCapacitySchema = z.object({
  shelterId: z.string().uuid('Invalid shelter ID'),
  refugeeCount: z.number().int().min(0, 'Refugee count cannot be negative'),
})

export type ShelterCapacityInput = z.infer<typeof shelterCapacitySchema>

// Shelter crew schema
export const shelterCrewSchema = z.object({
  shelterId: z.string().uuid('Invalid shelter ID'),
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['LOGISTICS', 'MEDICAL', 'SECURITY', 'KITCHEN', 'REGISTRATION', 'COMMUNICATION', 'TRANSPORT', 'WAREHOUSE'] as const),
})

export type ShelterCrewInput = z.infer<typeof shelterCrewSchema>