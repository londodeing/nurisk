// Resource Validation Schemas
import { z } from 'zod'
import { geoLocationSchema } from '../common/schemas'

// =============================================================================
// Resource Type Schema
// =============================================================================

export const resourceTypeSchema = z.enum([
  'FOOD',
  'WATER',
  'SHELTER',
  'MEDICAL',
  'TRANSPORT',
  'COMMUNICATION',
  'EQUIPMENT',
  'CLOTHING',
  'HYGIENE',
  'OTHER',
] as const)

// =============================================================================
// Resource Status Schema
// =============================================================================

export const resourceStatusSchema = z.enum([
  'available',
  'allocated',
  'consumed',
  'reserved',
] as const)

// =============================================================================
// Resource Schema
// =============================================================================

export const resourceSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
  name: z.string().min(1, 'Resource name is required').max(200, 'Resource name must not exceed 200 characters'),
  type: resourceTypeSchema,
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must not exceed 50 characters'),
  status: resourceStatusSchema,
  location: geoLocationSchema,
  supplier: z.string().max(200, 'Supplier must not exceed 200 characters').optional(),
  expiryDate: z.string().datetime({ message: 'Invalid expiry date format' }).optional(),
})

export type ResourceInput = z.infer<typeof resourceSchema>

// =============================================================================
// Resource Allocation Status Schema
// =============================================================================

export const resourceAllocationStatusSchema = z.enum([
  'pending',
  'in_transit',
  'delivered',
  'returned',
] as const)

// =============================================================================
// Resource Allocation Schema
// =============================================================================

export const resourceAllocationSchema = z.object({
  id: z.string().uuid('Invalid allocation ID'),
  resourceId: z.string().uuid('Invalid resource ID'),
  incidentId: z.string().uuid('Invalid incident ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  allocatedAt: z.string().datetime({ message: 'Invalid allocated at date format' }),
  allocatedBy: z.string().min(1, 'Allocated by is required').max(100, 'Allocated by must not exceed 100 characters'),
  status: resourceAllocationStatusSchema,
})

export type ResourceAllocationInput = z.infer<typeof resourceAllocationSchema>

// =============================================================================
// Resource Forecast Schema
// =============================================================================

export const resourceForecastSchema = z.object({
  resourceType: z.string(),
  currentStock: z.number().int().min(0),
  projectedDemand: z.number().int().min(0),
  shortfall: z.number().int().min(0),
  recommendedOrder: z.number().int().min(0),
  confidence: z.number().min(0).max(1),
  period: z.string(),
})

export type ResourceForecastInput = z.infer<typeof resourceForecastSchema>

// =============================================================================
// Resource Optimization Schema
// =============================================================================

export const resourceOptimizationSchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID'),
  resourceName: z.string(),
  currentStock: z.number().int().min(0),
  requiredStock: z.number().int().min(0),
  optimalAllocation: z.number().int().min(0),
  shortage: z.number().int().min(0),
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const),
  recommendations: z.array(z.string()),
})

export type ResourceOptimizationInput = z.infer<typeof resourceOptimizationSchema>

// =============================================================================
// Resource Filter Schema
// =============================================================================

export const resourceFilterSchema = z.object({
  type: resourceTypeSchema.optional(),
  status: resourceStatusSchema.optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID').optional(),
  incidentId: z.string().uuid('Invalid incident ID').optional(),
})

export type ResourceFilterInput = z.infer<typeof resourceFilterSchema>