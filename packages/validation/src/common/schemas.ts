// Common Validation Schemas
import { z } from 'zod'

// INTERNAL-ONLY: Re-export from api for internal use
// DO NOT export - use api/paginationSchema as canonical
import { paginationSchema, type PaginationInput } from '../api/schemas'

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid start date format' }),
  endDate: z.string().datetime({ message: 'Invalid end date format' }),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
})

export type DateRangeInput = z.infer<typeof dateRangeSchema>

// Geo location schema
export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  address: z.string().max(500).optional(),
  village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  regency: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
})

export type GeoLocationInput = z.infer<typeof geoLocationSchema>

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

export type IdParamInput = z.infer<typeof idParamSchema>

// Bulk IDs schema
export const bulkIdsSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID is required'),
})

export type BulkIdsInput = z.infer<typeof bulkIdsSchema>

// Search query schema
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query must not exceed 100 characters'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export type SearchInput = z.infer<typeof searchSchema>