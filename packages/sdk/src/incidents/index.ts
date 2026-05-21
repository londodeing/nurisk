// Incidents SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import { safeParseApiResponse, listResponseSchema, incidentSchema } from '../contracts'
import type {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentFilter,
  IncidentStatistics,
  IncidentTimelineEvent,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

export class IncidentsApi {
  constructor(private client: SdkClient) {}

  /**
   * Get all incidents - with contract validation
   * Uses safeParse (WARN-FIRST, FAIL-LATER)
   */
  async list(filter?: IncidentFilter & PaginationRequest): Promise<ListResponse<Incident>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Incident>>('/incidents', { params })
    
    // Validate response contract (safeParse - no crash)
    const validation = safeParseApiResponse(listResponseSchema(incidentSchema), res.data, {
      endpoint: '/incidents',
      isCanonical: true, // Hard-fail in production
    })
    
    if (!validation.success) {
      // In dev: return partial data with warning
      // In prod canonical: would throw (see validator.ts)
      console.warn('[SDK] Returning raw data due to validation failure')
    }
    
    return res.data!
  }

  async getById(id: string): Promise<Incident> {
    const res = await this.client.get<Incident>(`/incidents/${id}`)
    return res.data!
  }

  async create(data: CreateIncidentRequest): Promise<Incident> {
    const res = await this.client.post<Incident>('/incidents', data)
    return res.data!
  }

  async update(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    const res = await this.client.patch<Incident>(`/incidents/${id}`, data)
    return res.data!
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/incidents/${id}`)
  }

  async getTimeline(id: string): Promise<IncidentTimelineEvent[]> {
    const res = await this.client.get<IncidentTimelineEvent[]>(`/incidents/${id}/timeline`)
    return res.data!
  }

  async getStatistics(): Promise<IncidentStatistics> {
    const res = await this.client.get<IncidentStatistics>('/incidents/statistics')
    return res.data!
  }
}