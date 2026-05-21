// Pagination Schema - MINIMAL (safeParse mode)
import { z } from 'zod'

/**
 * PaginationMeta - MINIMAL fields only
 * Only validates what UI actually uses
 */
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative().optional(), // Optional for safety
  totalPages: z.number().int().nonnegative().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
})

export type PaginationMeta = z.infer<typeof paginationSchema>

/**
 * PaginationRequest - Query params
 */
export const paginationRequestSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).optional(),
})

export type PaginationRequest = z.infer<typeof paginationRequestSchema>