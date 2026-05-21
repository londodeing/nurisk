/**
 * NURisk SDK - Resource API
 * Resource management and tracking
 * 
 * IMPORTANT: Uses canonical ListResponse<T> as per PRD-EXEC-001
 * IMPORTANT: Uses safeParse validation (WARN-FIRST, FAIL-LATER)
 */
import { SdkClient, buildPaginationParams } from '../core'
import { safeParseApiResponse, listResponseSchema, resourceSchema } from '../contracts'
import type { Resource, ResourceAllocation, ResourceForecast } from '@nurisk/shared-types/resource'
import type { ListResponse, PaginationRequest } from '@nurisk/shared-types/api'

export type ResourceType = 'PERSONNEL' | 'VEHICLE' | 'EQUIPMENT' | 'SUPPLIES' | 'SHELTER'

export interface ResourceApiConfig {
  baseUrl?: string
}

export interface ResourceOptimization {
  resourceId: string
  issue: string
  suggestion: string
  potentialSavings: number
  priority: 'high' | 'medium' | 'low'
}

export interface ResourceStats {
  total: number
  available: number
  deployed: number
  utilizationRate: number
  lowStock: Resource[]
}

export interface ResourceFilter {
  type?: ResourceType
  status?: string
  warehouseId?: string
  incidentId?: string
}

export class ResourceApi {
  constructor(private client: SdkClient) {}

  /**
   * Get all resources - with contract validation
   * Uses safeParse (WARN-FIRST, FAIL-LATER)
   */
  async list(filter?: ResourceFilter & PaginationRequest): Promise<ListResponse<Resource>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Resource>>('/resource', { params })
    
    // Validate response contract (safeParse - no crash)
    const validation = safeParseApiResponse(listResponseSchema(resourceSchema), res.data, {
      endpoint: '/resource',
      isCanonical: true, // Hard-fail in production
    })
    
    if (!validation.success) {
      console.warn('[SDK] Returning raw data due to validation failure')
    }
    
    return res.data!
  }

  /**
   * Get resources by type
   */
  async getByType(type: ResourceType): Promise<ListResponse<Resource>> {
    return this.list({ type })
  }

  /**
   * Get single resource
   */
  async getById(id: string): Promise<Resource> {
    const res = await this.client.get<Resource>(`/resource/${id}`)
    return res.data!
  }

  /**
   * Create resource
   */
  async create(data: Partial<Resource>): Promise<Resource> {
    const res = await this.client.post<Resource>('/resource', data)
    return res.data!
  }

  /**
   * Update resource
   */
  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    const res = await this.client.patch<Resource>(`/resource/${id}`, data)
    return res.data!
  }

  /**
   * Delete resource
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/resource/${id}`)
  }

  /**
   * Allocate resource to incident
   */
  async allocate(allocation: ResourceAllocation): Promise<void> {
    await this.client.post('/resource/allocate', allocation)
  }

  /**
   * Deallocate resource
   */
  async deallocate(resourceId: string, incidentId: string): Promise<void> {
    await this.client.delete(`/resource/allocate?resourceId=${resourceId}&incidentId=${incidentId}`)
  }

  /**
   * Get resource forecast
   */
  async getForecast(type?: ResourceType): Promise<ResourceForecast[]> {
    const endpoint = type ? `/resource/forecast?type=${type}` : '/resource/forecast'
    const res = await this.client.get<ResourceForecast[]>(endpoint)
    return res.data!
  }

  /**
   * Get optimization suggestions
   */
  async getOptimization(): Promise<ResourceOptimization[]> {
    const res = await this.client.get<ResourceOptimization[]>('/resource/optimization')
    return res.data!
  }

  /**
   * Get resource stats
   */
  async getStats(): Promise<ResourceStats> {
    const res = await this.client.get<ResourceStats>('/resource/stats')
    return res.data!
  }

  /**
   * Get resource by incident
   */
  async getByIncident(incidentId: string): Promise<ListResponse<Resource>> {
    return this.list({ incidentId })
  }

  /**
   * Transfer resource between warehouses
   */
  async transfer(
    resourceId: string,
    fromWarehouse: string,
    toWarehouse: string,
    quantity: number
  ): Promise<void> {
    await this.client.post('/resource/transfer', { resourceId, fromWarehouse, toWarehouse, quantity })
  }
}