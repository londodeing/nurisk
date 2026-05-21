/**
 * NURisk SDK - Decision API
 * Decision management and approval workflow
 */
import type { Decision, DecisionStats, DecisionConfig } from '@nurisk/shared-types/decision'

export interface DecisionApiConfig {
  baseUrl?: string
}

export class DecisionApi {
  private baseUrl: string

  constructor(config: DecisionApiConfig = {}) {
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
      throw new Error(`DecisionApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get all decisions with filters
   */
  async getDecisions(params?: {
    status?: string
    type?: string
    madeBy?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ data: Decision[]; total: number }> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.type) searchParams.append('type', params.type)
    if (params?.madeBy) searchParams.append('madeBy', params.madeBy)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))

    return this.request<{ data: Decision[]; total: number }>(`/decision?${searchParams.toString()}`)
  }

  /**
   * Get single decision
   */
  async getDecision(id: string): Promise<Decision> {
    return this.request<Decision>(`/decision/${id}`)
  }

  /**
   * Get decision stats
   */
  async getStats(): Promise<DecisionStats> {
    return this.request<DecisionStats>('/decision/stats')
  }

  /**
   * Approve decision
   */
  async approve(id: string, notes?: string): Promise<Decision> {
    return this.request<Decision>(`/decision/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    })
  }

  /**
   * Reject decision
   */
  async reject(id: string, reason: string): Promise<Decision> {
    return this.request<Decision>(`/decision/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  /**
   * Modify decision
   */
  async modify(id: string, modifications: Record<string, unknown>): Promise<Decision> {
    return this.request<Decision>(`/decision/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({ modifications }),
    })
  }

  /**
   * Get config
   */
  async getConfig(): Promise<DecisionConfig> {
    return this.request<DecisionConfig>('/decision/config')
  }

  /**
   * Update config
   */
  async updateConfig(config: Partial<DecisionConfig>): Promise<DecisionConfig> {
    return this.request<DecisionConfig>('/decision/config', {
      method: 'PATCH',
      body: JSON.stringify(config),
    })
  }
}