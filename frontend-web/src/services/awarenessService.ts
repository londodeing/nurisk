// Awareness Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import {
  AwarenessApi,
  type Asset,
  type AssetType,
  type AssetStatus,
  type Incident,
  type Volunteer,
  type TimelineEvent,
  type GeoLocation,
  type BroadcastMessage,
  type CommunicationChannel,
} from '@nurisk/sdk'

export type {
  Asset,
  AssetType,
  AssetStatus,
  Incident,
  Volunteer,
  TimelineEvent,
  GeoLocation,
  BroadcastMessage,
  CommunicationChannel,
}

// Re-export from shared-types
export type { EvacuationRoute, ExclusionZone } from '@nurisk/shared-types/awareness'

// Create SDK instance
const awarenessApi = new AwarenessApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getAssetStatusColor = (status: AssetStatus): string => {
  const colors: Record<AssetStatus, string> = {
    available: '#22c55e',
    deployed: '#f59e0b',
    maintenance: '#6b7280',
    out_of_service: '#ef4444',
  }
  return colors[status] ?? '#6b7280'
}

export const getAssetTypeLabel = (type: AssetType): string => {
  const labels: Record<AssetType, string> = {
    vehicle: 'Vehicle',
    personnel: 'Personnel',
    equipment: 'Equipment',
    shelter: 'Shelter',
    warehouse: 'Warehouse',
  }
  return labels[type] ?? type
}

export const getAssets = () => awarenessApi.getAssets()
export const getAssetById = (id: string) => awarenessApi.getAssetById(id)
export const createAsset = (data: Parameters<typeof awarenessApi.createAsset>[0]) => awarenessApi.createAsset(data)
export const updateAsset = (id: string, data: Parameters<typeof awarenessApi.updateAsset>[1]) => awarenessApi.updateAsset(id, data)
export const deleteAsset = (id: string) => awarenessApi.deleteAsset(id)

export const getIncidents = () => awarenessApi.getIncidents()
export const getIncidentById = (id: string) => awarenessApi.getIncidentById(id)
export const createIncident = (data: Parameters<typeof awarenessApi.createIncident>[0]) => awarenessApi.createIncident(data)
export const updateIncident = (id: string, data: Parameters<typeof awarenessApi.updateIncident>[1]) => awarenessApi.updateIncident(id, data)
export const deleteIncident = (id: string) => awarenessApi.deleteIncident(id)

export const getVolunteers = () => awarenessApi.getVolunteers()
export const getVolunteerById = (id: string) => awarenessApi.getVolunteerById(id)
export const createVolunteer = (data: Parameters<typeof awarenessApi.createVolunteer>[0]) => awarenessApi.createVolunteer(data)
export const updateVolunteer = (id: string, data: Parameters<typeof awarenessApi.updateVolunteer>[1]) => awarenessApi.updateVolunteer(id, data)
export const deleteVolunteer = (id: string) => awarenessApi.deleteVolunteer(id)

export const getTimeline = (incidentId: string) => awarenessApi.getTimeline(incidentId)
export const addTimelineEvent = (incidentId: string, data: Parameters<typeof awarenessApi.addTimelineEvent>[1]) =>
  awarenessApi.addTimelineEvent(incidentId, data)

export const sendBroadcast = (data: BroadcastMessage) => awarenessApi.sendBroadcast(data)
export const getBroadcasts = () => awarenessApi.getBroadcasts()

export const getTacticalData = (incidentId: string) => awarenessApi.getTacticalData(incidentId)