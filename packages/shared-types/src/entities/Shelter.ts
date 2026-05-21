import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { ShelterStatus, ShelterCapacityStatus, ShelterCrewRole } from '../enums'

export interface Shelter extends BaseEntity {
  name: string
  code: string
  address: string
  region: string
  location: GeoLocation
  capacity: number
  currentOccupancy: number
  status: ShelterStatus
  capacityStatus: ShelterCapacityStatus
  incidentId?: string
  commanderId?: string
  picId?: string
  createdBy: string
}

export interface ShelterActivation {
  shelterId: string
  status: ShelterStatus
  activatedBy?: string
  activatedAt?: ISODateString
  commanderApprovedBy?: string
  commanderApprovedAt?: ISODateString
  notes?: string
}

export interface ShelterCapacity {
  total: number
  current: number
  available: number
  status: ShelterCapacityStatus
  lastUpdated?: ISODateString
}
