/**
 * NURisk SDK - Briefing API
 * Executive briefing and situation awareness
 * 
 * IMPORTANT: Uses safeParse validation (WARN-FIRST, FAIL-LATER)
 */
import { safeParseApiResponse } from '../contracts'
import type { ExecutiveBriefing, SituationSummary, KeyMetrics } from '@nurisk/shared-types/briefing'
import { z } from 'zod'

export type RegionStatus = 'normal' | 'watch' | 'warning' | 'emergency'

export interface RecommendedAction {
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  type: 'resource' | 'coordination' | 'communication' | 'evacuation'
  affectedRegions: string[]
}

export interface IncidentBrief {
  id: string
  title: string
  status: string
  severity: string
  location: string
  reportedAt: string
  affectedPopulation: number
  resourcesAllocated: number
  actionTaken: string
  nextSteps: string
}

export interface BriefingApiConfig {
  baseUrl?: string
}

// Minimal schema for briefing (safeParse mode)
const executiveBriefingSchema = z.object({
  id: z.string().optional(),
  period: z.string().optional(),
  generatedAt: z.string().optional(),
  situationSummary: z.unknown().optional(),
  keyMetrics: z.unknown().optional(),
  recommendedActions: z.array(z.unknown()).optional(),
})

export class BriefingApi {
  private baseUrl: string

  constructor(config: BriefingApiConfig = {}) {
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
      throw new Error(`BriefingApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Generate executive briefing - with contract validation
   * Uses safeParse (WARN-FIRST, FAIL-LATER)
   */
  async generateBriefing(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ExecutiveBriefing> {
    const data = await this.request<ExecutiveBriefing>('/briefing/generate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    })
    
    // Validate response contract (safeParse - no crash)
    const validation = safeParseApiResponse(executiveBriefingSchema, data, {
      endpoint: '/briefing/generate',
      isCanonical: true,
    })
    
    if (!validation.success) {
      console.warn('[SDK] Returning raw briefing data due to validation failure')
    }
    
    return data
  }

  /**
   * Get briefing history
   */
  async getBriefingHistory(limit = 10): Promise<ExecutiveBriefing[]> {
    return this.request<ExecutiveBriefing[]>(`/briefing/history?limit=${limit}`)
  }

  /**
   * Get current situation summary
   */
  async getSituationSummary(): Promise<SituationSummary> {
    return this.request<SituationSummary>('/briefing/situation')
  }

  /**
   * Get key metrics
   */
  async getKeyMetrics(): Promise<KeyMetrics> {
    return this.request<KeyMetrics>('/briefing/metrics')
  }

  /**
   * Get recommended actions
   */
  async getRecommendedActions(): Promise<RecommendedAction[]> {
    return this.request<RecommendedAction[]>('/briefing/actions')
  }

  /**
   * Get incident briefs
   */
  async getIncidentBriefs(): Promise<IncidentBrief[]> {
    return this.request<IncidentBrief[]>('/briefing/incidents')
  }

  /**
   * Export briefing as PDF
   */
  async exportBriefingPDF(briefing: ExecutiveBriefing): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/briefing/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ briefing }),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`BriefingApi: ${response.status} ${response.statusText}`)
    }

    return response.blob()
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get status color
   */
  getStatusColor(status: 'normal' | 'elevated' | 'critical' | 'emergency'): string {
    const colors: Record<string, string> = {
      normal: 'bg-green-100 text-green-700',
      elevated: 'bg-amber-100 text-amber-700',
      critical: 'bg-orange-100 text-orange-700',
      emergency: 'bg-red-100 text-red-700',
    }
    return colors[status]
  }

  /**
   * Get status label
   */
  getStatusLabel(status: 'normal' | 'elevated' | 'critical' | 'emergency'): string {
    const labels: Record<string, string> = {
      normal: 'Normal',
      elevated: 'Waspada',
      critical: 'Kritis',
      emergency: 'Darurat',
    }
    return labels[status]
  }

  /**
   * Get region status color
   */
  getRegionStatusColor(status: RegionStatus): string {
    const colors: Record<RegionStatus, string> = {
      normal: 'bg-green-100 text-green-700',
      watch: 'bg-blue-100 text-blue-700',
      warning: 'bg-amber-100 text-amber-700',
      emergency: 'bg-red-100 text-red-700',
    }
    return colors[status]
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: RecommendedAction['priority']): string {
    const colors: Record<RecommendedAction['priority'], string> = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      critical: 'bg-red-100 text-red-600',
    }
    return colors[priority]
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority: RecommendedAction['priority']): string {
    const labels: Record<RecommendedAction['priority'], string> = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      critical: 'Kritis',
    }
    return labels[priority]
  }

  /**
   * Get action type label
   */
  getActionTypeLabel(type: RecommendedAction['type']): string {
    const labels: Record<RecommendedAction['type'], string> = {
      resource: 'Sumber Daya',
      coordination: 'Koordinasi',
      communication: 'Komunikasi',
      evacuation: 'Evakuasi',
    }
    return labels[type]
  }

  /**
   * Format response time
   */
  formatResponseTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
}