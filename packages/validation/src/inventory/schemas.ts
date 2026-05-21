// Inventory Validation Schemas
import { z } from 'zod'

// Create supply schema
export const createSupplySchema = z.object({
  name: z.string().min(1, 'Supply name is required').max(100, 'Supply name must not exceed 100 characters'),
  category: z.enum([
    'FOOD',
    'WATER',
    'MEDICAL',
    'CLOTHING',
    'BLANKET',
    'MATTRESS',
    'TENT',
    'HYGIENE',
    'KITCHEN',
    'LIGHTING',
    'GENERATOR',
    'FUEL',
    'TRANSPORT',
  ] as const),
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must not exceed 50 characters'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  minStock: z.number().int().min(0, 'Minimum stock must be at least 0').optional(),
  expiryDate: z.string().datetime().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'DISTRIBUTED', 'EXPIRED'] as const).optional(),
})

export type CreateSupplyInput = z.infer<typeof createSupplySchema>

// Update supply schema
export const updateSupplySchema = createSupplySchema.partial().extend({
  id: z.string().uuid('Invalid supply ID'),
})

export type UpdateSupplyInput = z.infer<typeof updateSupplySchema>

// Supply request schema
export const supplyRequestSchema = z.object({
  incidentId: z.string().uuid('Invalid incident ID'),
  shelterId: z.string().uuid('Invalid shelter ID').optional(),
  items: z.array(z.object({
    supplyId: z.string().uuid('Invalid supply ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'At least one item is required'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).optional(),
})

export type SupplyRequestInput = z.infer<typeof supplyRequestSchema>

// Supply allocation schema
export const allocationSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  items: z.array(z.object({
    supplyId: z.string().uuid('Invalid supply ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'At least one item is required'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
})

export type AllocationInput = z.infer<typeof allocationSchema>