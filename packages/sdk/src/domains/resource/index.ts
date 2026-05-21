// Resource Domain - CRUD-friendly
import { client } from '../../core/client'
import type { Resource, ResourceAllocation, ResourceForecast } from '@nurisk/shared-types/resource'

export interface ResourceFilters {
  type?: string
  status?: 'available' | 'allocated' | 'consumed' | 'reserved'
  incidentId?: string
}

export const resourceApi = {
  list: (params?: ResourceFilters): Promise<Resource[]> =>
    client.get<Resource[]>('/api/v1/resource', { params }).then((res) => res.data!),

  getById: (id: string): Promise<Resource> =>
    client.get<Resource>(`/api/v1/resource/${id}`).then((res) => res.data!),

  create: (data: Partial<Resource>): Promise<Resource> =>
    client.post<Resource>('/api/v1/resource', data).then((res) => res.data!),

  update: (id: string, data: Partial<Resource>): Promise<Resource> =>
    client.patch<Resource>(`/api/v1/resource/${id}`, data).then((res) => res.data!),

  delete: (id: string): Promise<void> =>
    client.delete<void>(`/api/v1/resource/${id}`).then((res) => res.data!),

  allocate: (allocation: ResourceAllocation): Promise<void> =>
    client.post<void>('/api/v1/resource/allocate', allocation).then((res) => res.data!),

  deallocate: (resourceId: string, incidentId: string): Promise<void> =>
    client
      .delete<void>(`/api/v1/resource/allocate?resourceId=${resourceId}&incidentId=${incidentId}`)
      .then((res) => res.data!),

  getForecast: (type?: string): Promise<ResourceForecast[]> => {
    const endpoint = type
      ? `/api/v1/resource/forecast?type=${type}`
      : '/api/v1/resource/forecast'
    return client.get<ResourceForecast[]>(endpoint).then((res) => res.data!)
  },

  getByIncident: (incidentId: string): Promise<Resource[]> =>
    client
      .get<Resource[]>('/api/v1/resource', { params: { incidentId } })
      .then((res) => res.data!),

  transfer: (
    resourceId: string,
    fromWarehouse: string,
    toWarehouse: string,
    quantity: number
  ): Promise<void> =>
    client
      .post<void>('/api/v1/resource/transfer', {
        resourceId,
        fromWarehouse,
        toWarehouse,
        quantity,
      })
      .then((res) => res.data),
}