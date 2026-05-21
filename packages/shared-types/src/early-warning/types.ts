import type { WarningSeverity, WarningStatus } from '../enums'

export interface Warning {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  title: string
  description: string
  severity: WarningSeverity
  status: WarningStatus
  affectedAreas: string[]
  issuedAt: string
  expiresAt: string
  source?: string
  incidentId?: string
  regionId?: string
  createdBy?: string
}

export interface WarningFilter {
  severity?: WarningSeverity
  status?: WarningStatus
  incidentId?: string
  regionId?: string
  source?: string
  createdBy?: string
}
