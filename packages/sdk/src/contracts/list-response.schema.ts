// ListResponse Schema - MINIMAL (safeParse mode)
import { z } from 'zod'
import { paginationSchema } from './pagination.schema'

/**
 * ListResponseSchema<T> - Canonical list response
 * Shape: { items: T[], pagination: {...} }
 * 
 * Uses MINIMAL validation - only checks structure
 * Individual item validation done by caller
 */
export function listResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(z.unknown()), // Minimal - just check it's array
    pagination: paginationSchema,
  })
}

export type ListResponse<T> = {
  items: T[]
  pagination: z.infer<typeof paginationSchema>
}