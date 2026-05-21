/**
 * NURisk SDK - Agent API
 * Agent governance and bias monitoring
 */
export type AgentStatus = 'active' | 'idle' | 'error'
export type AgentType = 'classifier' | 'predictor' | 'recommender' | 'analyzer'

export interface AgentConfig {
  enabled: boolean
  model?: string
  maxRetries?: number
  timeout?: number
  parameters?: Record<string, unknown>
}

export interface AgentMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageConfidence: number
  averageProcessingTime: number
  lastExecutedAt?: string
}

export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  currentTask?: string
  uptime: number
  actionsCount: number
  config: AgentConfig
  metrics: AgentMetrics
  createdAt: string
  updatedAt?: string
}

export interface AgentLog {
  id: string
  agentId: string
  agentName: string
  level: 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

export interface AgentAction {
  id: string
  agentId: string
  action: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
  status: 'pending' | 'success' | 'error'
  confidence?: number
  processingTime?: number
  executedAt: string
}

export interface AgentError {
  id: string
  agentId: string
  error: string
  stack?: string
  context?: Record<string, unknown>
  occurredAt: string
}

export interface ResourceUsage {
  cpu: number
  memory: number
  timestamp: string
}

// =============================================================================
// Bias Monitoring Types
// =============================================================================

export interface GeographicBias {
  regionDistribution: Record<string, number>
  regionResponseTimes: Record<string, number>
  regionAccuracy: Record<string, number>
  underservedRegions: string[]
  biasScore: number
}

export interface DemographicBias {
  ageDistribution: Record<string, number>
  genderDistribution: Record<string, number>
  socioeconomicBias: Record<string, number>
  accessibilityScore: number
  biasScore: number
}

export interface TemporalBias {
  hourlyDistribution: Record<string, number>
  dailyDistribution: Record<string, number>
  seasonalTrends: Record<string, number>
  responseTimeByHour: Record<string, number>
  biasScore: number
}

export interface BiasMetrics {
  geographic: GeographicBias
  demographic: DemographicBias
  temporal: TemporalBias
}

export interface BiasAlert {
  id: string
  type: 'geographic' | 'demographic' | 'temporal'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, unknown>
  detectedAt: string
}

export interface BiasReport {
  generatedAt: string
  period: { start: string; end: string }
  metrics: BiasMetrics
  alerts: BiasAlert[]
  recommendations: string[]
}

export interface AgentApiConfig {
  baseUrl?: string
}

export class AgentApi {
  private baseUrl: string

  constructor(config: AgentApiConfig = {}) {
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
      throw new Error(`AgentApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // =============================================================================
  // Agent Governance
  // =============================================================================

  /**
   * Get all agents
   */
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/agents')
  }

  /**
   * Get agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`)
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(id: string, config: Partial<AgentConfig>): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}/config`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    })
  }

  /**
   * Toggle agent on/off
   */
  async toggleAgent(id: string, enabled: boolean): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
  }

  /**
   * Get agent logs
   */
  async getAgentLogs(params?: {
    agentId?: string
    level?: 'info' | 'warn' | 'error'
    search?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<AgentLog[]> {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<AgentLog[]>(`/agents/logs${query}`)
  }

  /**
   * Get agent actions
   */
  async getAgentActions(agentId: string, limit = 10): Promise<AgentAction[]> {
    return this.request<AgentAction[]>(`/agents/${agentId}/actions?limit=${limit}`)
  }

  /**
   * Get agent errors
   */
  async getAgentErrors(agentId: string, limit = 10): Promise<AgentError[]> {
    return this.request<AgentError[]>(`/agents/${agentId}/errors?limit=${limit}`)
  }

  /**
   * Get agent resource usage
   */
  async getAgentResourceUsage(agentId: string, duration = 60): Promise<ResourceUsage[]> {
    return this.request<ResourceUsage[]>(`/agents/${agentId}/resources?duration=${duration}`)
  }

  // =============================================================================
  // Bias Monitoring
  // =============================================================================

  /**
   * Get bias report
   */
  async getBiasReport(days = 30): Promise<BiasReport> {
    return this.request<BiasReport>(`/bias/report?days=${days}`)
  }

  /**
   * Get bias alerts
   */
  async getBiasAlerts(limit = 10): Promise<BiasAlert[]> {
    return this.request<BiasAlert[]>(`/bias/alerts?limit=${limit}`)
  }

  /**
   * Get bias metrics by type
   */
  async getBiasMetrics(
    type: 'geographic' | 'demographic' | 'temporal'
  ): Promise<GeographicBias | DemographicBias | TemporalBias> {
    return this.request<GeographicBias | DemographicBias | TemporalBias>(`/bias/metrics/${type}`)
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get agent status color
   */
  getAgentStatusColor(status: AgentStatus): string {
    const colors: Record<AgentStatus, string> = {
      active: '#22C55E',
      idle: '#EAB308',
      error: '#EF4444',
    }
    return colors[status] || '#6B7280'
  }

  /**
   * Get agent status label
   */
  getAgentStatusLabel(status: AgentStatus): string {
    const labels: Record<AgentStatus, string> = {
      active: 'Aktif',
      idle: 'Idle',
      error: 'Error',
    }
    return labels[status] || status
  }

  /**
   * Get agent type label
   */
  getAgentTypeLabel(type: AgentType): string {
    const labels: Record<AgentType, string> = {
      classifier: 'Klasifikasi',
      predictor: 'Prediksi',
      recommender: 'Rekomendasi',
      analyzer: 'Analisis',
    }
    return labels[type] || type
  }

  /**
   * Format uptime
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  /**
   * Get bias severity color
   */
  getBiasSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      low: '#22C55E',
      medium: '#EAB308',
      high: '#F97316',
      critical: '#EF4444',
    }
    return colors[severity] || '#6B7280'
  }

  /**
   * Get bias score color
   */
  getBiasScoreColor(score: number): string {
    if (score < 20) return '#22C55E'
    if (score < 40) return '#84CC16'
    if (score < 60) return '#EAB308'
    if (score < 80) return '#F97316'
    return '#EF4444'
  }
}