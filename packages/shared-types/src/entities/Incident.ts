import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { DisasterType, IncidentStatus, PriorityLevel } from '../enums'

export interface Incident extends BaseEntity {
  title: string
  description: string
  type: DisasterType
  status: IncidentStatus
  severity: PriorityLevel
  location: GeoLocation
  reportedBy: string
  reportedByName?: string
  assignedTo?: string[]
  assignedToNames?: string[]
  casualties?: number
  affectedCount?: number
  estimatedDamage?: number
  startedAt: ISODateString
  endedAt?: ISODateString
}
