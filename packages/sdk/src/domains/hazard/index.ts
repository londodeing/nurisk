import { client } from '../../core/client'
import type { HazardZone, VulnerabilityAssessment } from '@nurisk/shared-types/hazard'

export interface HazardFilters {
  regionId?: string
  hazardType?: HazardZone['hazardType']
  severity?: HazardZone['severity']
}

export const hazardApi = {
  getZones: (params?: HazardFilters): Promise<HazardZone[]> =>
    client.get<HazardZone[]>('/hazard/zones', { params }).then((r) => r.data!),

  getZoneById: (id: string): Promise<HazardZone> =>
    client.get<HazardZone>(`/hazard/zones/${id}`).then((r) => r.data!),

  createZone: (data: {
    name: string
    hazardType: HazardZone['hazardType']
    severity: HazardZone['severity']
    polygonGeometry: HazardZone['polygonGeometry']
    description?: string
    population?: number
    area?: number
    regionId?: string
    incidentId?: string
  }): Promise<HazardZone> =>
    client.post<HazardZone>('/hazard/zones', data).then((r) => r.data!),

  updateZone: (id: string, data: Partial<HazardZone>): Promise<HazardZone> =>
    client.patch<HazardZone>(`/hazard/zones/${id}`, data).then((r) => r.data!),

  deleteZone: (id: string): Promise<void> =>
    client.delete(`/hazard/zones/${id}`).then(() => undefined),

  getVulnerability: (params?: {
    regionId?: string
    hazardZoneId?: string
  }): Promise<VulnerabilityAssessment[]> =>
    client.get<VulnerabilityAssessment[]>('/hazard/vulnerability', { params }).then((r) => r.data!),

  getVulnerabilityByRegion: (
    regionId: string,
    hazardZoneId: string
  ): Promise<VulnerabilityAssessment> =>
    client
      .get<VulnerabilityAssessment>(`/hazard/vulnerability/${regionId}/${hazardZoneId}`)
      .then((r) => r.data!),

  getHeatmap: (): Promise<{
    regionId: string
    hazards: { hazardType: string; vulnerabilityIndex: number }[]
  }[]> =>
    client
      .get<{
        regionId: string
        hazards: { hazardType: string; vulnerabilityIndex: number }[]
      }[]>('/hazard/heatmap')
      .then((r) => r.data!),
}
