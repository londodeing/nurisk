import type { DisasterType } from '../incident/enums'
import type { HazardSeverity } from '../enums'
import type { GeoJSONCollection } from '../map/types'

export interface HazardZone {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  name: string
  hazardType: DisasterType
  severity: HazardSeverity
  polygonGeometry: GeoJSONCollection
  description?: string
  population?: number
  area?: number
  regionId?: string
  incidentId?: string
}

export interface VulnerabilityAssessment {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  score: number
  factors?: Record<string, number>
  recommendations?: string
  assessedAt: string
  hazardZoneId: string
  regionId?: string
  assessedBy?: string
}
