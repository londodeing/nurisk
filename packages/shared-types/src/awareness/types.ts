import type { GeoLocation } from '../common/types'
import type { GeoJSONCollection } from '../map/types'
import type { ExclusionZoneType, ExclusionZoneLevel, TacticalPriority } from '../enums'
import type { Incident } from '../incident/types'
import type { Volunteer } from '../volunteer/types'

export type { Incident } from '../incident/types'
export type { Volunteer } from '../volunteer/types'

export interface EvacuationRoute {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  name?: string
  description?: string
  route?: GeoJSONCollection
  originId?: string
  origin?: string
  destinationId?: string
  destination?: string
  distance?: number
  estimatedTime?: number
  status?: 'ACTIVE' | 'BLOCKED' | 'CLOSED' | 'UNDER_MAINTENANCE'
  incidentId?: string
}

export interface ExclusionZone {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  name: string
  geometry: GeoJSONCollection
  radius?: number
  restrictionType: ExclusionZoneType
  level: ExclusionZoneLevel
  description?: string
  restrictions: string[]
  effectiveFrom: string
  effectiveTo?: string
  hazardZoneId?: string
  incidentId?: string
  regionId?: string
}

export interface TacticalData {
  id: string
  createdAt: string
  updatedAt: string
  incidentId: string
  priority: TacticalPriority
  perimeter?: GeoJSONCollection
  description?: string
  metadata?: Record<string, unknown>
  deployedUnits: number
  sheltersOccupied: number
  resourcesDeployed: number
  regionId?: string
  createdBy?: string
}

export interface Asset {
  id: string
  name: string
  type: 'vehicle' | 'personnel' | 'equipment' | 'warehouse'
  location: GeoLocation
  status: 'active' | 'inactive' | 'maintenance'
  lastUpdated: string
}

export interface CommunicationChannel {
  id: string
  name: string
  type: 'radio' | 'phone' | 'chat' | 'broadcast'
  frequency?: string
  status: 'active' | 'inactive'
}

export interface BroadcastMessage {
  id: string
  channelId: string
  message: string
  senderId: string
  sentAt: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface TimelineEvent {
  id: string
  type: string
  description: string
  timestamp: string
  userId?: string
  metadata?: Record<string, unknown>
}
