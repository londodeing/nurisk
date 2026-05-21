/**
 * NURisk SDK - Awareness API
 * Tactical awareness and operational data
 */
import type { EvacuationRoute, ExclusionZone, TacticalData } from '@nurisk/shared-types/awareness'

export type AssetType = 'vehicle' | 'equipment' | 'personnel' | 'shelter' | 'hospital'
export type AssetStatus = 'available' | 'deployed' | 'maintenance' | 'offline'
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface GeoLocation {
  lat: number
  lng: number
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  status: AssetStatus
  location: GeoLocation
  batteryLevel?: number
  fuelLevel?: number
  lastUpdate: string
  assignedTo?: string
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: string
  location: GeoLocation
  reportedAt: string
  updatedAt: string
  assignedTo?: string
  type: string
}

export interface Volunteer {
  id: string
  name: string
  role: string
  status: 'active' | 'standby' | 'offline'
  location: GeoLocation
  lastCheckIn: string
  assignedIncident?: string
}

export interface CommunicationChannel {
  id: string
  name: string
  type: 'broadcast' | 'team' | 'emergency'
  active: boolean
  lastMessage?: string
  lastMessageTime?: string
}

export interface BroadcastMessage {
  id: string
  channelId: string
  sender: string
  message: string
  timestamp: string
  priority: 'normal' | 'urgent' | 'emergency'
}

export interface TimelineEvent {
  id: string
  type: 'incident' | 'asset' | 'volunteer' | 'system'
  action: string
  description: string
  timestamp: string
  entityId?: string
  entityName?: string
}

export interface AwarenessApiConfig {
  baseUrl?: string
}

export class AwarenessApi {
  private baseUrl: string

  constructor(config: AwarenessApiConfig = {}) {
    this.baseUrl = config.baseUrl ?? '/api'
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`AwarenessApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get tactical data
   */
  async getTacticalData(): Promise<TacticalData> {
    return this.request<TacticalData>('/awareness/tactical')
  }

  /**
   * Get all assets
   */
  async getAssets(): Promise<Asset[]> {
    return this.request<Asset[]>('/awareness/assets')
  }

  /**
   * Get all incidents
   */
  async getIncidents(): Promise<Incident[]> {
    return this.request<Incident[]>('/awareness/incidents')
  }

  /**
   * Get all volunteers
   */
  async getVolunteers(): Promise<Volunteer[]> {
    return this.request<Volunteer[]>('/awareness/volunteers')
  }

  /**
   * Get evacuation routes
   */
  async getEvacuationRoutes(): Promise<EvacuationRoute[]> {
    return this.request<EvacuationRoute[]>('/awareness/routes')
  }

  /**
   * Get exclusion zones
   */
  async getExclusionZones(): Promise<ExclusionZone[]> {
    return this.request<ExclusionZone[]>('/awareness/zones')
  }

  /**
   * Get communication channels
   */
  async getCommunicationChannels(): Promise<CommunicationChannel[]> {
    return this.request<CommunicationChannel[]>('/awareness/channels')
  }

  /**
   * Get broadcast messages
   */
  async getBroadcasts(): Promise<BroadcastMessage[]> {
    return this.request<BroadcastMessage[]>('/awareness/broadcasts')
  }

  /**
   * Get timeline events
   */
  async getTimeline(hours: number = 24): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>(`/awareness/timeline?hours=${hours}`)
  }

  /**
   * Send broadcast message
   */
  async sendBroadcast(
    channelId: string,
    message: string,
    priority: 'normal' | 'urgent' | 'emergency' = 'normal'
  ): Promise<BroadcastMessage> {
    return this.request<BroadcastMessage>('/awareness/broadcast', {
      method: 'POST',
      body: JSON.stringify({ channelId, message, priority }),
    })
  }

  /**
   * Update asset location
   */
  async updateAssetLocation(assetId: string, location: GeoLocation): Promise<Asset> {
    return this.request<Asset>(`/awareness/assets/${assetId}/location`, {
      method: 'PUT',
      body: JSON.stringify(location),
    })
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get asset status color
   */
  getAssetStatusColor(status: AssetStatus): string {
    const colors: Record<AssetStatus, string> = {
      available: 'text-green-600 bg-green-50',
      deployed: 'text-blue-600 bg-blue-50',
      maintenance: 'text-amber-600 bg-amber-50',
      offline: 'text-slate-600 bg-slate-50',
    }
    return colors[status]
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity: IncidentSeverity): string {
    const colors: Record<IncidentSeverity, string> = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-amber-600 bg-amber-50',
      low: 'text-blue-600 bg-blue-50',
    }
    return colors[severity]
  }

  /**
   * Get incident status color
   */
  getIncidentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      new: 'text-red-600 bg-red-50',
      assigned: 'text-amber-600 bg-amber-50',
      in_progress: 'text-blue-600 bg-blue-50',
      resolved: 'text-green-600 bg-green-50',
      closed: 'text-slate-600 bg-slate-50',
    }
    return colors[status]
  }

  /**
   * Format time ago
   */
  formatTimeAgo(timestamp: string): string {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins}m yang lalu`
    if (diffHours < 24) return `${diffHours}h yang lalu`
    return `${diffDays}d yang lalu`
  }

  /**
   * Get asset type label
   */
  getAssetTypeLabel(type: AssetType): string {
    const labels: Record<AssetType, string> = {
      vehicle: 'Kendaraan',
      equipment: 'Peralatan',
      personnel: 'Personel',
      shelter: 'Shelter',
      hospital: 'Rumah Sakit',
    }
    return labels[type]
  }

  /**
   * Get volunteer status color
   */
  getVolunteerStatusColor(status: 'active' | 'standby' | 'offline'): string {
    const colors: Record<string, string> = {
      active: 'text-green-600 bg-green-50',
      standby: 'text-amber-600 bg-amber-50',
      offline: 'text-slate-600 bg-slate-50',
    }
    return colors[status]
  }
}