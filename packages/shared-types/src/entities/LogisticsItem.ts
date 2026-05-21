import type { BaseEntity } from '../common/entity'
import type { LogisticsSupplyStatus } from '../enums'

export interface LogisticsItem extends BaseEntity {
  name: string
  category: string
  quantity: number
  unit: string
  status: LogisticsSupplyStatus
  notes?: string
}
