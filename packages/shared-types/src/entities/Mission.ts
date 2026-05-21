import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { MissionStatus, MissionType } from '../enums'

export interface Mission extends BaseEntity {
  incidentId: string
  name: string
  type: MissionType
  status: MissionStatus
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  location: GeoLocation
  description?: string
  startedAt?: ISODateString
  endedAt?: ISODateString
}

export interface MissionAssignment extends BaseEntity {
  missionId: string
  assigneeId: string
  assigneeName?: string
  role: string
  assignedAt: ISODateString
}

export interface MissionReport {
  id: string
  missionId: string
  summary: string
  findings: string[]
  recommendations?: string[]
  reportedBy: string
  reportedByName?: string
  createdAt: ISODateString
}
