/**
 * @deprecated
 * Transitional compatibility wrapper.
 * Use @nurisk/sdk instead.
 *
 * This module delegates all requests to AgentApi from @nurisk/sdk.
 * Direct HTTP logic has been moved to the SDK for centralized transport management.
 */
import { AgentApi } from '@nurisk/sdk'

export type { AgentStatus, AgentType, AgentConfig, AgentMetrics, Agent, AgentLog, AgentAction, AgentError, ResourceUsage, GeographicBias, DemographicBias, TemporalBias, BiasMetrics, BiasAlert, BiasReport } from '@nurisk/sdk'

// Mock data for development
export const MOCK_AGENTS: any[] = []

export const MOCK_BIAS_REPORT: any = {
  geographicBias: [],
  demographicBias: [],
  temporalBias: [],
  overallScore: 0,
  alerts: []
}

// Create singleton instance
const agentApi = new AgentApi({
  baseUrl: typeof window !== 'undefined'
    ? (window as unknown as { ENV?: { API_BASE_URL?: string } }).ENV?.API_BASE_URL ?? '/api'
    : '/api'
})

// =============================================================================
// API Functions - Agent Governance
// =============================================================================

/**
 * Get all agents
 * @deprecated Use agentApi.getAgents() from @nurisk/sdk instead
 */
export async function getAgents(): Promise<Agent[]> {
  return agentApi.getAgents()
}

/**
 * Get agent by ID
 * @deprecated Use agentApi.getAgent() from @nurisk/sdk instead
 */
export async function getAgent(id: string): Promise<Agent> {
  return agentApi.getAgent(id)
}

/**
 * Update agent configuration
 * @deprecated Use agentApi.updateAgentConfig() from @nurisk/sdk instead
 */
export async function updateAgentConfig(
  id: string,
  config: Partial<AgentConfig>
): Promise<Agent> {
  return agentApi.updateAgentConfig(id, config)
}

/**
 * Toggle agent on/off
 * @deprecated Use agentApi.toggleAgent() from @nurisk/sdk instead
 */
export async function toggleAgent(id: string, enabled: boolean): Promise<Agent> {
  return agentApi.toggleAgent(id, enabled)
}

/**
 * Get agent logs
 * @deprecated Use agentApi.getAgentLogs() from @nurisk/sdk instead
 */
export async function getAgentLogs(params?: {
  agentId?: string
  level?: 'info' | 'warn' | 'error'
  search?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}): Promise<AgentLog[]> {
  return agentApi.getAgentLogs(params)
}

/**
 * Get agent actions
 * @deprecated Use agentApi.getAgentActions() from @nurisk/sdk instead
 */
export async function getAgentActions(
  agentId: string,
  limit = 10
): Promise<AgentAction[]> {
  return agentApi.getAgentActions(agentId, limit)
}

/**
 * Get agent errors
 * @deprecated Use agentApi.getAgentErrors() from @nurisk/sdk instead
 */
export async function getAgentErrors(
  agentId: string,
  limit = 10
): Promise<AgentError[]> {
  return agentApi.getAgentErrors(agentId, limit)
}

/**
 * Get agent resource usage
 * @deprecated Use agentApi.getAgentResourceUsage() from @nurisk/sdk instead
 */
export async function getAgentResourceUsage(
  agentId: string,
  duration = 60
): Promise<ResourceUsage[]> {
  return agentApi.getAgentResourceUsage(agentId, duration)
}

// =============================================================================
// API Functions - Bias Monitoring
// =============================================================================

/**
 * Get bias report
 * @deprecated Use agentApi.getBiasReport() from @nurisk/sdk instead
 */
export async function getBiasReport(days = 30): Promise<BiasReport> {
  return agentApi.getBiasReport(days)
}

/**
 * Get bias alerts
 * @deprecated Use agentApi.getBiasAlerts() from @nurisk/sdk instead
 */
export async function getBiasAlerts(limit = 10): Promise<{
  id: string
  type: 'geographic' | 'demographic' | 'temporal'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  details: Record<string, unknown>
  detectedAt: string
}[]> {
  return agentApi.getBiasAlerts(limit)
}

/**
 * Get bias metrics by type
 * @deprecated Use agentApi.getBiasMetrics() from @nurisk/sdk instead
 */
export async function getBiasMetrics(
  type: 'geographic' | 'demographic' | 'temporal'
): Promise<{
  regionDistribution?: Record<string, number>
  regionResponseTimes?: Record<string, number>
  regionAccuracy?: Record<string, number>
  underservedRegions?: string[]
  biasScore?: number
  ageDistribution?: Record<string, number>
  genderDistribution?: Record<string, number>
  socioeconomicBias?: Record<string, number>
  accessibilityScore?: number
  hourlyDistribution?: Record<string, number>
  dailyDistribution?: Record<string, number>
  seasonalTrends?: Record<string, number>
  responseTimeByHour?: Record<string, number>
}> {
  return agentApi.getBiasMetrics(type)
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get agent status color
 * @deprecated Use agentApi.getAgentStatusColor() from @nurisk/sdk instead
 */
export function getAgentStatusColor(status: 'active' | 'idle' | 'error'): string {
  return agentApi.getAgentStatusColor(status)
}

/**
 * Get agent status label
 * @deprecated Use agentApi.getAgentStatusLabel() from @nurisk/sdk instead
 */
export function getAgentStatusLabel(status: 'active' | 'idle' | 'error'): string {
  return agentApi.getAgentStatusLabel(status)
}

/**
 * Get agent type label
 * @deprecated Use agentApi.getAgentTypeLabel() from @nurisk/sdk instead
 */
export function getAgentTypeLabel(type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'): string {
  return agentApi.getAgentTypeLabel(type)
}

/**
 * Format uptime
 * @deprecated Use agentApi.formatUptime() from @nurisk/sdk instead
 */
export function formatUptime(seconds: number): string {
  return agentApi.formatUptime(seconds)
}

/**
 * Get bias severity color
 * @deprecated Use agentApi.getBiasSeverityColor() from @nurisk/sdk instead
 */
export function getBiasSeverityColor(severity: string): string {
  return agentApi.getBiasSeverityColor(severity)
}

/**
 * Get bias score color
 * @deprecated Use agentApi.getBiasScoreColor() from @nurisk/sdk instead
 */
export function getBiasScoreColor(score: number): string {
  return agentApi.getBiasScoreColor(score)
}