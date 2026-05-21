import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { RequestPriority, LogisticsRequestStatus, LogisticsSupplyStatus } from '../enums'

export interface SupplyItem extends BaseEntity {
  name: string
  category: string
  quantity: number
  unit: string
  notes?: string
}

export interface Transport {
  id: string
  vehicleNumber?: string
  driverName?: string
  driverPhone?: string
  type: string
  capacity?: number
  status?: string
}

export interface LogisticsRequest extends BaseEntity {
  incidentId: string
  requestNumber?: string
  requestedBy: string
  requestedByName?: string
  priority: RequestPriority
  status: LogisticsRequestStatus
  originWarehouseId?: string
  originWarehouseName?: string
  destination: GeoLocation
  destinationAddress?: string
  items: SupplyItem[]
  transport?: Transport
  estimatedArrival?: ISODateString
  actualArrival?: ISODateString
  notes?: string
}

export interface Fulfillment extends BaseEntity {
  requestId: string
  warehouseId: string
  warehouseName?: string
  items: SupplyItem[]
  dispatchedAt?: ISODateString
  deliveredAt?: ISODateString
  status: LogisticsSupplyStatus
  notes?: string
}
