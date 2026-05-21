// Resource Schema - MINIMAL (safeParse mode)
import { z } from 'zod'

/**
 * Resource - MINIMAL fields only
 * Only validates what UI actually uses right now
 */
export const resourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  type: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  status: z.string().optional(),
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional(),
    })
    .optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional(),
})

export type Resource = z.infer<typeof resourceSchema>

/**
 * ResourceFilter - Query params
 */
export const resourceFilterSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  warehouseId: z.string().optional(),
  incidentId: z.string().optional(),
})

export type ResourceFilter = z.infer<typeof resourceFilterSchema>