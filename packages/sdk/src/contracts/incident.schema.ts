// Incident Schema - MINIMAL (safeParse mode)
import { z } from 'zod'

/**
 * Incident - MINIMAL fields only
 * Only validates what UI actually uses right now
 */
export const incidentSchema = z.object({
  id: z.string().uuid(),
  incidentCode: z.string().optional(),
  title: z.string().optional(),
  disasterType: z.string().optional(),
  status: z.string().optional(),
  region: z.string().optional(),
  kecamatan: z.string().optional(),
  desa: z.string().optional(),
  priorityScore: z.number().optional(),
  priorityLevel: z.string().optional(),
  description: z.string().optional(),
  reporterName: z.string().optional(),
  whatsappNumber: z.string().optional(),
  eventDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Incident = z.infer<typeof incidentSchema>

/**
 * IncidentFilter - Query params
 */
export const incidentFilterSchema = z.object({
  disasterType: z.string().optional(),
  status: z.string().optional(),
  priorityLevel: z.string().optional(),
  region: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type IncidentFilter = z.infer<typeof incidentFilterSchema>