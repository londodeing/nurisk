// API Validation Schemas
import { z } from 'zod'

// =============================================================================
// Pagination Schema
// =============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).optional(),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// =============================================================================
// Pagination Meta Schema
// =============================================================================

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
})

export type PaginationMetaInput = z.infer<typeof paginationMetaSchema>

// =============================================================================
// List Response Schema
// =============================================================================

/**
 * Canonical ListResponse schema
 * Shape: { items: T[], pagination: {...} }
 */
export function listResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: paginationMetaSchema,
  })
}

export type ListResponseInput<T> = {
  items: T[]
  pagination: z.infer<typeof paginationMetaSchema>
}

// =============================================================================
// API Error Schema
// =============================================================================

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  field: z.string().optional(),
})

export type ApiErrorInput = z.infer<typeof apiErrorSchema>

// =============================================================================
// API Response Schema
// =============================================================================

export function apiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema,
    meta: z
      .object({
        pagination: paginationMetaSchema.optional(),
        timestamp: z.string().optional(),
        requestId: z.string().optional(),
      })
      .optional(),
  })
}