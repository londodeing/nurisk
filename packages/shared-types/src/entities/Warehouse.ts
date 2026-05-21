import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { WarehouseStatus, MovementType, WarehouseCrewRole } from '../enums'

export interface Warehouse extends BaseEntity {
  name: string
  code: string
  address: string
  region: string
  location: GeoLocation
  capacity: number
  currentStock: number
  status: WarehouseStatus
  picId?: string
  createdBy: string
}

export interface WarehouseStock {
  id: string
  warehouseId: string
  itemName: string
  itemType: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  expiryDate?: ISODateString
  lastUpdated: ISODateString
}

export interface WarehouseMovement {
  id: string
  warehouseId: string
  stockId: string
  type: MovementType
  quantity: number
  reference?: string
  notes?: string
  movedBy: string
  movedAt: ISODateString
}

export interface WarehouseCrew {
  id: string
  warehouseId: string
  volunteerId: string
  volunteerName: string
  role: WarehouseCrewRole
  shiftStart: ISODateString
  shiftEnd?: ISODateString
  status: 'ASSIGNED' | 'ON_DUTY' | 'OFF_DUTY'
  assignedAt: ISODateString
  assignedBy: string
}

export interface WarehouseEquipment {
  id: string
  warehouseId: string
  name: string
  type: 'FORKLIFT' | 'PALLET' | 'FREEZER' | 'TRUCK' | 'RADIO' | 'GENERATOR'
  quantity: number
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN'
  assignedTo?: string
}

export interface WarehouseAssignment {
  warehouseId: string
  incidentId?: string
  shelterId?: string
  assignedAt: ISODateString
  assignedBy: string
}
