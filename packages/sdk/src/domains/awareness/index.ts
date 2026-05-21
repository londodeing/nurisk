import { client } from '../../core/client'
import type { EvacuationRoute, ExclusionZone, TacticalData } from '@nurisk/shared-types/awareness'
import type { ExclusionZoneType, ExclusionZoneLevel } from '@nurisk/shared-types/enums'

export const awarenessApi = {
  getRoutes: (params?: {
    status?: EvacuationRoute['status']
    originId?: string
    destinationId?: string
  }): Promise<EvacuationRoute[]> =>
    client.get<EvacuationRoute[]>('/awareness/routes', { params }).then((r) => r.data!),

  getRouteById: (id: string): Promise<EvacuationRoute> =>
    client.get<EvacuationRoute>(`/awareness/routes/${id}`).then((r) => r.data!),

  createRoute: (data: {
    name?: string
    description?: string
    route?: EvacuationRoute['route']
    originId?: string
    origin?: string
    destinationId?: string
    destination?: string
    distance?: number
    estimatedTime?: number
    status?: EvacuationRoute['status']
    incidentId?: string
  }): Promise<EvacuationRoute> =>
    client.post<EvacuationRoute>('/awareness/routes', data).then((r) => r.data!),

  getZones: (params?: {
    restrictionType?: ExclusionZoneType
    level?: ExclusionZoneLevel
  }): Promise<ExclusionZone[]> =>
    client.get<ExclusionZone[]>('/awareness/zones', { params }).then((r) => r.data!),

  getZoneById: (id: string): Promise<ExclusionZone> =>
    client.get<ExclusionZone>(`/awareness/zones/${id}`).then((r) => r.data!),

  updateZone: (id: string, data: Partial<ExclusionZone>): Promise<ExclusionZone> =>
    client.patch<ExclusionZone>(`/awareness/zones/${id}`, data).then((r) => r.data!),

  getTactical: (incidentId: string): Promise<TacticalData> =>
    client.get<TacticalData>(`/awareness/tactical/${incidentId}`).then((r) => r.data!),
}
