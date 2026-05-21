// Warehouse Validation Schemas
import { z } from 'zod'

// Create warehouse schema
export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(100, 'Warehouse name must not exceed 100 characters'),
  region: z.string().min(1, 'Region is required').max(100, 'Region must not exceed 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must not exceed 200 characters'),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  status: z.enum(['ACTIVE', 'LIMITED', 'FULL', 'MAINTENANCE', 'INACTIVE'] as const).optional(),
  picId: z.string().uuid('Invalid PIC ID').optional(),
})

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>

// Update warehouse schema
export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  id: z.string().uuid('Invalid warehouse ID'),
})

export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>

// Stock movement schema
export const movementSchema = z.object({
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  supplyId: z.string().uuid('Invalid supply ID'),
  movementType: z.enum(['INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT'] as const),
  quantity: z.number().int().positive('Quantity must be positive'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  destinationWarehouseId: z.string().uuid('Invalid destination warehouse ID').optional(),
})

export type MovementInput = z.infer<typeof movementSchema>

// Warehouse crew schema
export const warehouseCrewSchema = z.object({
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['LOGISTICS', 'INVENTORY', 'SECURITY', 'TRANSPORT', 'FORKLIFT', 'CLERK'] as const),
})

export type WarehouseCrewInput = z.infer<typeof warehouseCrewSchema>