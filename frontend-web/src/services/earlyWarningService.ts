import type { Warning, WarningFilter } from '@nurisk/shared-types/early-warning'
import type { WarningSeverity } from '@nurisk/shared-types/enums'

export type { Warning, WarningFilter }
export type { WarningSeverity }

export const getWarningLevelColor = (level: WarningSeverity) => {
  const colors: Record<string, string> = {
    INFORMATIONAL: 'bg-blue-100 text-blue-700',
    ADVISORY: 'bg-yellow-100 text-yellow-700',
    WATCH: 'bg-orange-100 text-orange-700',
    WARNING: 'bg-red-100 text-red-700',
    EMERGENCY: 'bg-purple-100 text-purple-700',
  }
  return colors[level] ?? colors.INFORMATIONAL
}

export const getWarningLevelLabel = (level: WarningSeverity) => {
  const labels: Record<WarningSeverity, string> = {
    ADVISORY: 'Advisory',
    WATCH: 'Watch',
    WARNING: 'Warning',
    EMERGENCY: 'Emergency',
  }
  return labels[level] ?? 'Unknown'
}

export const formatIssuedTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleString('id-ID')
}

export const getTimeUntilExpiry = (expiryString?: string) => {
  if (!expiryString) return null
  const expiry = new Date(expiryString)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  if (diff < 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export const isWarningExpired = (warning: Warning) => {
  if (!warning.expiresAt) return false
  return new Date(warning.expiresAt) < new Date()
}

export const getWarningTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    gempa: 'Earthquake',
    tsunami: 'Tsunami',
    banjir: 'Flood',
    cuaca: 'Weather',
    kebakaran: 'Fire',
    longsor: 'Landslide',
    lainnya: 'Other',
  }
  return labels[type] ?? type
}

export const getSeverityLabel = (severity: string) => {
  const labels: Record<string, string> = {
    LOW: 'Rendah',
    MODERATE: 'Sedang',
    HIGH: 'Tinggi',
    EXTREME: 'Ekstrem',
  }
  return labels[severity] ?? severity
}

export const dismissWarning = (id: string) => {
  console.log('Dismissing warning:', id)
}

export const broadcastWarning = (id: string) => {
  console.log('Broadcasting warning:', id)
}

export const getBmkgFeed = () => Promise.resolve([] as Warning[])
export const getHistoricalEvents = () => Promise.resolve([] as Warning[])

export const MOCK_WARNINGS: Warning[] = []
export const MOCK_ACTIVE_WARNINGS: Warning[] = []

export interface WarningArea {
  id: string
  name: string
  coordinates: [number, number][]
}

export interface WarningCreateRequest {
  title: string
  description: string
  severity: WarningSeverity
  status: string
  affectedAreas: string[]
  issuedAt: string
  expiresAt: string
  source?: string
  incidentId?: string
  regionId?: string
  createdBy?: string
}

export interface WarningSource {
  id: string
  name: string
  type: 'bmkg' | 'ina' | 'international'
}

import { EarlyWarningApi } from '@nurisk/sdk/early-warning'
const earlyWarningApi = new EarlyWarningApi({ baseUrl: '/api' })

export const getWarnings = (filters?: WarningFilter) => earlyWarningApi.getWarnings(filters as any)
export const getWarning = (id: string) => earlyWarningApi.getWarning(id)
export const getWarningById = (id: string) => earlyWarningApi.getWarning(id)
export const createWarning = (data: WarningCreateRequest) => earlyWarningApi.createWarning(data as any)
export const updateWarning = (id: string, data: any) => earlyWarningApi.updateWarning(id, data)
export const deleteWarning = (id: string) => earlyWarningApi.deleteWarning(id)
export const getActiveWarnings = () => earlyWarningApi.getActiveWarnings()
