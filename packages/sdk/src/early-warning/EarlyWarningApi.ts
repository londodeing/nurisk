/**
 * NURisk SDK - Early Warning API
 * Early warning and alert management
 */
import type { Warning, WarningFilter } from '@nurisk/shared-types/early-warning'

export type WarningLevel = 'advisory' | 'watch' | 'warning' | 'emergency'
export type WarningType = 'weather' | 'flood' | 'earthquake' | 'tsunami' | 'volcano' | 'landslide' | 'fire'

export type WarningSource = 'BMKG' | 'BNPB' | 'weatherService' | 'internal'

export interface WarningArea {
  id: string
  name: string
  coordinates: [number, number][]
  center: { lat: number; lng: number }
}

export interface WarningCreateRequest {
  headline: string
  description: string
  type: WarningType
  level: WarningLevel
  affectedAreas: WarningArea[]
  recommendedActions: string[]
  expiresAt: string
  severity: number
  magnitude?: number
  epicenter?: { lat: number; lng: number }
  depth?: number
  estimatedHeight?: number
}

export interface EarlyWarningApiConfig {
  baseUrl?: string
}

export class EarlyWarningApi {
  private baseUrl: string

  constructor(config: EarlyWarningApiConfig = {}) {
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
      throw new Error(`EarlyWarningApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get all warnings with optional filters
   */
  async getWarnings(filters?: {
    type?: WarningType
    level?: WarningLevel
    source?: WarningSource
    isActive?: boolean
    areaId?: string
  }): Promise<Warning[]> {
    const params = new URLSearchParams()

    if (filters?.type) params.append('type', filters.type)
    if (filters?.level) params.append('level', filters.level)
    if (filters?.source) params.append('source', filters.source)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.areaId) params.append('areaId', filters.areaId)

    return this.request<Warning[]>(`/warnings?${params.toString()}`)
  }

  /**
   * Get active warnings only
   */
  async getActiveWarnings(): Promise<Warning[]> {
    return this.request<Warning[]>('/warnings?isActive=true')
  }

  /**
   * Get warning by ID
   */
  async getWarning(id: string): Promise<Warning> {
    return this.request<Warning>(`/warnings/${id}`)
  }

  /**
   * Create new warning (admin only)
   */
  async createWarning(warning: WarningCreateRequest): Promise<Warning> {
    return this.request<Warning>('/warnings', {
      method: 'POST',
      body: JSON.stringify(warning),
    })
  }

  /**
   * Update warning (admin only)
   */
  async updateWarning(id: string, warning: Partial<WarningCreateRequest>): Promise<Warning> {
    return this.request<Warning>(`/warnings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warning),
    })
  }

  /**
   * Delete warning (admin only)
   */
  async deleteWarning(id: string): Promise<void> {
    await this.request<void>(`/warnings/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Dismiss warning
   */
  async dismissWarning(id: string): Promise<Warning> {
    return this.request<Warning>(`/warnings/${id}/dismiss`, {
      method: 'POST',
    })
  }

  /**
   * Broadcast warning notification
   */
  async broadcastWarning(
    id: string,
    channels: string[] = ['push', 'sms', 'email']
  ): Promise<{ sent: number }> {
    return this.request<{ sent: number }>(`/warnings/${id}/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ channels }),
    })
  }

  /**
   * Get BMKG feed
   */
  async getBmkgFeed(): Promise<Warning[]> {
    return this.request<Warning[]>('/warnings/bmkg')
  }

  /**
   * Get historical similar events
   */
  async getHistoricalEvents(
    type: WarningType,
    areaId: string,
    limit = 10
  ): Promise<Warning[]> {
    return this.request<Warning[]>(
      `/warnings/history?type=${type}&areaId=${areaId}&limit=${limit}`
    )
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get warning level color
   */
  getWarningLevelColor(level: WarningLevel): string {
    const colors: Record<WarningLevel, string> = {
      advisory: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      watch: 'bg-orange-100 text-orange-700 border-orange-300',
      warning: 'bg-red-100 text-red-700 border-red-300',
      emergency: 'bg-purple-100 text-purple-700 border-purple-300',
    }
    return colors[level]
  }

  /**
   * Get warning level label
   */
  getWarningLevelLabel(level: WarningLevel): string {
    const labels: Record<WarningLevel, string> = {
      advisory: 'Advisory',
      watch: 'Watch',
      warning: 'Peringatan',
      emergency: 'Darurat',
    }
    return labels[level]
  }

  /**
   * Get warning type label
   */
  getWarningTypeLabel(type: WarningType): string {
    const labels: Record<WarningType, string> = {
      weather: 'Cuaca Ekstrem',
      flood: 'Banjir',
      earthquake: 'Gempa Bumi',
      tsunami: 'Tsunami',
      volcano: 'Gunung Meletus',
      landslide: 'Longsor',
      fire: 'Kebakaran',
    }
    return labels[type]
  }

  /**
   * Get warning type icon
   */
  getWarningTypeIcon(type: WarningType): string {
    const icons: Record<WarningType, string> = {
      weather: '⛈️',
      flood: '🌊',
      earthquake: '📉',
      tsunami: '🌊',
      volcano: '🌋',
      landslide: '⛰️',
      fire: '🔥',
    }
    return icons[type] || '⚠️'
  }

  /**
   * Check if warning is expired
   */
  isWarningExpired(warning: Warning): boolean {
    return new Date(warning.expiresAt) < new Date()
  }

  /**
   * Get time until expiry
   */
  getTimeUntilExpiry(warning: Warning): string {
    const now = new Date()
    const expires = new Date(warning.expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff < 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}h remaining`
    }
    if (hours > 0) {
      return `${hours}j ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  /**
   * Format issued time
   */
  formatIssuedTime(isoString: string): string {
    const date = new Date(isoString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Get severity label
   */
  getSeverityLabel(severity: number): string {
    if (severity <= 1) return 'Sangat Rendah'
    if (severity <= 2) return 'Rendah'
    if (severity <= 3) return 'Sedang'
    if (severity <= 4) return 'Tinggi'
    return 'Sangat Tinggi'
  }
}