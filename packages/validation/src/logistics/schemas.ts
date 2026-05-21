// Logistics Validation Schemas
import { z } from 'zod'
import { geoLocationSchema } from '../common'

// Supply item schema
export const supplyItemSchema = z.object({
  id: z.string().uuid('Invalid item ID').optional(),
  name: z.string().min(1, 'Item name is required').max(200, 'Item name must not exceed 200 characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must not exceed 100 characters'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must not exceed 50 characters'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
})

export type SupplyItemInput = z.infer<typeof supplyItemSchema>

// Transport schema
export const transportSchema = z.object({
  id: z.string().uuid('Invalid transport ID').optional(),
  type: z.enum(['TRUCK', 'VAN', 'MOTORCYCLE', 'BOAT', 'HELICOPTER', 'AIRPLANE'] as const, { message: 'Invalid transport type' }),
  vehicleNumber: z.string().max(50).optional(),
  driverName: z.string().max(100).optional(),
  driverPhone: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  status: z.string().max(50).optional(),
})

export type TransportInput = z.infer<typeof transportSchema>

// Create logistics request schema
export const createLogisticsRequestSchema = z.object({
  incidentId: z.string().uuid('Invalid incident ID'),
  requestNumber: z.string().max(50).optional(),
  requestedBy: z.string().uuid('Invalid requester ID'),
  requestedByName: z.string().max(100).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const, { message: 'Invalid priority' }),
  status: z.enum(['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'] as const).optional(),
  originWarehouseId: z.string().uuid('Invalid warehouse ID').optional(),
  originWarehouseName: z.string().max(100).optional(),
  destination: geoLocationSchema,
  destinationAddress: z.string().max(500).optional(),
  items: z.array(supplyItemSchema).min(1, 'At least one item is required'),
  transport: transportSchema.optional(),
  estimatedArrival: z.string().datetime({ message: 'Invalid estimated arrival date' }).optional(),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
})

export type CreateLogisticsRequestInput = z.infer<typeof createLogisticsRequestSchema>

// Update logistics request schema (partial update)
export const updateLogisticsRequestSchema = createLogisticsRequestSchema.partial().extend({
  id: z.string().uuid('Invalid request ID'),
})

export type UpdateLogisticsRequestInput = z.infer<typeof updateLogisticsRequestSchema>
