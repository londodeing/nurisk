import { z } from 'zod';

// Shelter creation schema
export const createShelterSchema = z.object({
  name: z.string().min(1, 'Shelter name is required').max(100, 'Shelter name must not exceed 100 characters'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters'),
  location: z.any().refine((val) => val != null && typeof val === 'object', 'Location must be a valid PostGIS geometry object'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  refugee_count: z.number().int().min(0, 'Refugee count cannot be negative').optional(),
  water_stock_liters: z.number().int().min(0, 'Water stock cannot be negative').optional(),
  toilet_count: z.number().int().min(0, 'Toilet count cannot be negative').optional(),
  status: z.enum(['AKTIF', 'FULL', 'CLOSED'], 'Invalid shelter status').optional(),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must not exceed 100').optional(),
  stock_status: z.string().max(50, 'Stock status must not exceed 50 characters').optional(),
  incident_id: z.string().uuid('Invalid incident ID').optional().nullable(),
}).refine((data) => {
  // Ensure refugee count does not exceed capacity
  if (data.refugee_count !== undefined && data.capacity !== undefined) {
    return data.refugee_count <= data.capacity;
  }
  return true;
}, {
  message: "Refugee count cannot exceed shelter capacity",
  path: ["refugee_count"]
});

// Shelter update schema (partial update)
export const updateShelterSchema = z.object({
  id: z.string().uuid('Invalid shelter ID'),
  name: z.string().min(1, 'Shelter name is required').max(100, 'Shelter name must not exceed 100 characters').optional(),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters').optional(),
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters').optional(),
  location: z.any().refine((val) => val == null || (typeof val === 'object'), 'Location must be a valid PostGIS geometry object').optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  refugee_count: z.number().int().min(0, 'Refugee count cannot be negative').optional(),
  water_stock_liters: z.number().int().min(0, 'Water stock cannot be negative').optional(),
  toilet_count: z.number().int().min(0, 'Toilet count cannot be negative').optional(),
  status: z.enum(['AKTIF', 'FULL', 'CLOSED'], 'Invalid shelter status').optional(),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must not exceed 100').optional(),
  stock_status: z.string().max(50, 'Stock status must not exceed 50 characters').optional(),
  incident_id: z.string().uuid('Invalid incident ID').optional().nullable(),
}).refine((data) => {
  // Ensure refugee count does not exceed capacity if both are provided
  if (data.refugee_count !== undefined && data.capacity !== undefined) {
    return data.refugee_count <= data.capacity;
  }
  return true;
}, {
  message: "Refugee count cannot exceed shelter capacity",
  path: ["refugee_count"]
});

// Export index for easy exporting
export * from './shelter.validator';