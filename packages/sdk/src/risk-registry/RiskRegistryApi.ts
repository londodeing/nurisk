/**
 * NURisk SDK - Risk Registry API
 * Risk management and tracking
 */
import type { Risk, RiskMatrixCell, RiskSummary } from '@nurisk/shared-types/risk'
import type { RiskFilters, RiskLikelihood, RiskImpact, RiskStatus, RiskCategory } from '@nurisk/shared-types/types'

export interface RiskRegistryApiConfig {
  baseUrl?: string
}

export class RiskRegistryApi {
  private baseUrl: string

  constructor(config: RiskRegistryApiConfig = {}) {
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
      throw new Error(`RiskRegistryApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get all risks
   */
  async getRisks(filters?: RiskFilters): Promise<Risk[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.minLikelihood) params.append('minLikelihood', String(filters.minLikelihood))
    if (filters?.minImpact) params.append('minImpact', String(filters.minImpact))

    return this.request<Risk[]>(`/risks?${params.toString()}`)
  }

  /**
   * Get risk by ID
   */
  async getRiskById(id: string): Promise<Risk> {
    return this.request<Risk>(`/risks/${id}`)
  }

  /**
   * Create new risk
   */
  async createRisk(
    risk: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Risk> {
    return this.request<Risk>('/risks', {
      method: 'POST',
      body: JSON.stringify(risk),
    })
  }

  /**
   * Update risk
   */
  async updateRisk(id: string, updates: Partial<Risk>): Promise<Risk> {
    return this.request<Risk>(`/risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Delete risk
   */
  async deleteRisk(id: string): Promise<void> {
    await this.request<void>(`/risks/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get risk summary
   */
  async getRiskSummary(): Promise<RiskSummary> {
    return this.request<RiskSummary>('/risks/summary')
  }

  /**
   * Get risk matrix data
   */
  async getRiskMatrix(): Promise<RiskMatrixCell[]> {
    return this.request<RiskMatrixCell[]>('/risks/matrix')
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Calculate inherent risk score
   */
  calculateInherentRisk(likelihood: RiskLikelihood, impact: RiskImpact): number {
    return likelihood * impact
  }

  /**
   * Calculate residual risk score
   */
  calculateResidualRisk(
    likelihood: RiskLikelihood,
    impact: RiskImpact,
    mitigationProgress: number
  ): number {
    const inherent = likelihood * impact
    const mitigationFactor = 1 - mitigationProgress / 100
    return Math.round(inherent * mitigationFactor)
  }

  /**
   * Get risk level from score
   */
  getRiskLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 15) return 'high'
    if (score >= 8) return 'medium'
    return 'low'
  }

  /**
   * Get risk level color
   */
  getRiskLevelColor(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high':
        return '#dc2626'
      case 'medium':
        return '#f59e0b'
      case 'low':
        return '#16a34a'
    }
  }

  /**
   * Get risk level background color
   */
  getRiskLevelBgColor(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high':
        return '#fef2f2'
      case 'medium':
        return '#fffbeb'
      case 'low':
        return '#f0fdf4'
    }
  }

  /**
   * Get likelihood label
   */
  getLikelihoodLabel(likelihood: RiskLikelihood): string {
    switch (likelihood) {
      case 1:
        return 'Sangat Rendah'
      case 2:
        return 'Rendah'
      case 3:
        return 'Sedang'
      case 4:
        return 'Tinggi'
      case 5:
        return 'Sangat Tinggi'
    }
  }

  /**
   * Get impact label
   */
  getImpactLabel(impact: RiskImpact): string {
    switch (impact) {
      case 1:
        return 'Sangat Rendah'
      case 2:
        return 'Rendah'
      case 3:
        return 'Sedang'
      case 4:
        return 'Tinggi'
      case 5:
        return 'Sangat Tinggi'
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: RiskStatus): string {
    switch (status) {
      case 'identified':
        return 'Teridentifikasi'
      case 'mitigating':
        return 'Mitigasi'
      case 'monitoring':
        return 'Pemantauan'
      case 'closed':
        return 'Tertutup'
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status: RiskStatus): string {
    switch (status) {
      case 'identified':
        return '#6366f1'
      case 'mitigating':
        return '#f59e0b'
      case 'monitoring':
        return '#0ea5e9'
      case 'closed':
        return '#16a34a'
    }
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: RiskCategory): string {
    switch (category) {
      case 'operational':
        return 'Operasional'
      case 'financial':
        return 'Keuangan'
      case 'reputational':
        return 'Reputasi'
      case 'compliance':
        return 'Kepatuhan'
      case 'technical':
        return 'Teknis'
    }
  }

  /**
   * Format risk score
   */
  formatRiskScore(score: number): string {
    return score.toFixed(0)
  }

  /**
   * Sort risks by inherent risk
   */
  sortRisksByInherentRisk(risks: Risk[]): Risk[] {
    return [...risks].sort(
      (a, b) => b.likelihood * b.impact - a.likelihood * a.impact
    )
  }

  /**
   * Filter high risks
   */
  filterHighRisks(risks: Risk[]): Risk[] {
    return risks.filter((r) => r.likelihood * r.impact >= 15)
  }
}