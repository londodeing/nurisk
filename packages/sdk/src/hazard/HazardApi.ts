/**
 * NURisk SDK - Hazard API
 * Hazard zone and vulnerability management
 */
import type { HazardZone, VulnerabilityAssessment } from '@nurisk/shared-types/hazard'

export type HazardType = 'flood' | 'earthquake' | 'landslide' | 'volcanic' | 'tsunami' | 'drought'

export type SeverityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'

export interface VulnerabilityHeatmapData {
  region_id: string
  hazards: {
    hazard_type: string
    vulnerability_index: number
    population_exposed: number
    infrastructure_value: number
  }[]
  max_vulnerability: number
  total_population_exposed: number
}

export interface HazardStats {
  hazard_type: HazardType
  severity_level: SeverityLevel
  zone_count: number
  total_population: number
  total_infrastructure: number
}

export interface VulnerabilityScore {
  vulnerability_score: number
  risk_level: 'low' | 'moderate' | 'high' | 'very_high'
  region: string
  hazard_type: HazardType
  zones_count: number
  details: {
    zone_id: number
    severity_level: SeverityLevel
    population_exposed: number
    infrastructure_value: number
    zone_score: string
  }[]
}

export interface HazardApiConfig {
  baseUrl?: string
}

export class HazardApi {
  private baseUrl: string

  constructor(config: HazardApiConfig = {}) {
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
      throw new Error(`HazardApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get all hazard zones
   */
  async getHazardZones(filters?: {
    region?: string
    hazard_type?: HazardType
    severity_level?: SeverityLevel
  }): Promise<HazardZone[]> {
    const params = new URLSearchParams()
    if (filters?.region) params.append('region', filters.region)
    if (filters?.hazard_type) params.append('hazard_type', filters.hazard_type)
    if (filters?.severity_level) params.append('severity_level', filters.severity_level)

    return this.request<HazardZone[]>(`/hazard-zones?${params.toString()}`)
  }

  /**
   * Get hazard zone by ID
   */
  async getHazardZoneById(id: number): Promise<HazardZone> {
    return this.request<HazardZone>(`/hazard-zones/${id}`)
  }

  /**
   * Create hazard zone
   */
  async createHazardZone(data: {
    region: string
    hazard_type: HazardType
    severity_level: SeverityLevel
    recurrence_interval?: string
    polygon_geometry?: number[][]
    population_exposed?: number
    infrastructure_value?: number
  }): Promise<HazardZone> {
    return this.request<HazardZone>('/hazard-zones', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update hazard zone
   */
  async updateHazardZone(
    id: number,
    data: Partial<{
      region: string
      hazard_type: HazardType
      severity_level: SeverityLevel
      recurrence_interval?: string
      polygon_geometry?: number[][]
      population_exposed?: number
      infrastructure_value?: number
    }>
  ): Promise<HazardZone> {
    return this.request<HazardZone>(`/hazard-zones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete hazard zone
   */
  async deleteHazardZone(id: number): Promise<void> {
    await this.request<void>(`/hazard-zones/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get vulnerability assessments
   */
  async getVulnerabilityAssessments(filters?: {
    region_id?: string
    hazard_type?: string
  }): Promise<VulnerabilityAssessment[]> {
    const params = new URLSearchParams()
    if (filters?.region_id) params.append('region_id', filters.region_id)
    if (filters?.hazard_type) params.append('hazard_type', filters.hazard_type)

    return this.request<VulnerabilityAssessment[]>(`/vulnerability?${params.toString()}`)
  }

  /**
   * Get vulnerability by region
   */
  async getVulnerabilityByRegion(
    regionId: string,
    hazardType: string
  ): Promise<VulnerabilityAssessment> {
    return this.request<VulnerabilityAssessment>(`/vulnerability/${regionId}/${hazardType}`)
  }

  /**
   * Get vulnerability heatmap data
   */
  async getVulnerabilityHeatmap(): Promise<VulnerabilityHeatmapData[]> {
    return this.request<VulnerabilityHeatmapData[]>('/vulnerability/heatmap')
  }

  /**
   * Get vulnerability summary
   */
  async getVulnerabilitySummary(): Promise<VulnerabilityAssessment[]> {
    return this.request<VulnerabilityAssessment[]>('/vulnerability/summary')
  }

  /**
   * Get hazard stats by region
   */
  async getHazardStatsByRegion(region: string): Promise<HazardStats[]> {
    return this.request<HazardStats[]>(`/hazard-zones/stats/${region}`)
  }

  /**
   * Calculate vulnerability score
   */
  async calculateVulnerabilityScore(
    region: string,
    hazardType: HazardType
  ): Promise<VulnerabilityScore> {
    return this.request<VulnerabilityScore>(
      `/hazard-zones/vulnerability-score?region=${region}&hazard_type=${hazardType}`
    )
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get hazard type label
   */
  getHazardTypeLabel(type: HazardType): string {
    const labels: Record<HazardType, string> = {
      flood: 'Banjir',
      earthquake: 'Gempa Bumi',
      landslide: 'Tanah Longsor',
      volcanic: 'Gunung Berapi',
      tsunami: 'Tsunami',
      drought: 'Kekeringan',
    }
    return labels[type] || type
  }

  /**
   * Get hazard type color
   */
  getHazardTypeColor(type: HazardType): string {
    const colors: Record<HazardType, string> = {
      flood: '#3B82F6',
      earthquake: '#EF4444',
      landslide: '#F97316',
      volcanic: '#DC2626',
      tsunami: '#06B6D4',
      drought: '#EAB308',
    }
    return colors[type] || '#6B7280'
  }

  /**
   * Get severity level color
   */
  getSeverityColor(level: SeverityLevel): string {
    const colors: Record<SeverityLevel, string> = {
      very_low: '#22C55E',
      low: '#84CC16',
      moderate: '#EAB308',
      high: '#F97316',
      very_high: '#EF4444',
    }
    return colors[level] || '#6B7280'
  }

  /**
   * Get severity level label
   */
  getSeverityLabel(level: SeverityLevel): string {
    const labels: Record<SeverityLevel, string> = {
      very_low: 'Sangat Rendah',
      low: 'Rendah',
      moderate: 'Sedang',
      high: 'Tinggi',
      very_high: 'Sangat Tinggi',
    }
    return labels[level] || level
  }

  /**
   * Get vulnerability color (gradient)
   */
  getVulnerabilityColor(value: number): string {
    if (value < 20) return '#22C55E'
    if (value < 40) return '#84CC16'
    if (value < 60) return '#EAB308'
    if (value < 80) return '#F97316'
    return '#EF4444'
  }

  /**
   * Get vulnerability label
   */
  getVulnerabilityLabel(value: number): string {
    if (value < 20) return 'Rendah'
    if (value < 40) return 'Rendah Sedang'
    if (value < 60) return 'Sedang'
    if (value < 80) return 'Tinggi'
    return 'Sangat Tinggi'
  }

  /**
   * Get vulnerability gradient CSS
   */
  getVulnerabilityGradient(): string {
    return 'linear-gradient(to right, #22C55E, #84CC16, #EAB308, #F97316, #EF4444)'
  }
}