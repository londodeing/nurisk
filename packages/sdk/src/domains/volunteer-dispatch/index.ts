// Volunteer Dispatch Domain - Orchestration (ACTION-BASED)
import { client } from '../../core/client'
import type { Deployment, AvailabilitySlot } from '@nurisk/shared-types/volunteer-dispatch'

export interface DispatchPayload {
  volunteerId: string
  incidentId: string
  role: string
  startAt: string
}

export const volunteerDispatchApi = {
  dispatch: (payload: DispatchPayload): Promise<Deployment> =>
    client.post<Deployment>('/api/v1/volunteer-dispatch/dispatch', payload).then(
      (res) => res.data!
    ),

  getDeployments: (params?: {
    volunteerId?: string
    incidentId?: string
    status?: Deployment['status']
  }): Promise<Deployment[]> =>
    client
      .get<Deployment[]>('/api/v1/volunteer-dispatch/deployments', { params })
      .then((res) => res.data!),

  getDeploymentById: (id: string): Promise<Deployment> =>
    client
      .get<Deployment>(`/api/v1/volunteer-dispatch/deployments/${id}`)
      .then((res) => res.data!),

  updateStatus: (
    id: string,
    status: Deployment['status'],
    location?: { latitude: number; longitude: number }
  ): Promise<Deployment> =>
    client
      .patch<Deployment>(`/api/v1/volunteer-dispatch/deployments/${id}`, {
        status,
        location,
      })
      .then((res) => res.data!),

  cancel: (id: string): Promise<Deployment> =>
    client
      .post<Deployment>(`/api/v1/volunteer-dispatch/deployments/${id}/cancel`, {})
      .then((res) => res.data!),

  getAvailability: (volunteerId: string): Promise<AvailabilitySlot[]> =>
    client
      .get<AvailabilitySlot[]>(`/api/v1/volunteer-dispatch/availability/${volunteerId}`)
      .then((res) => res.data!),

  setAvailability: (
    volunteerId: string,
    slots: AvailabilitySlot[]
  ): Promise<AvailabilitySlot[]> =>
    client
      .post<AvailabilitySlot[]>(`/api/v1/volunteer-dispatch/availability`, {
        volunteerId,
        slots,
      })
      .then((res) => res.data!),
}