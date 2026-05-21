/**
 * @deprecated
 * Transitional compatibility wrapper.
 * Use @nurisk/sdk/agent instead.
 *
 * This module delegates all requests to AgentApi from @nurisk/sdk.
 * Direct HTTP logic has been moved to the SDK for centralized transport management.
 */
import { AgentApi } from '@nurisk/sdk/agent'

export type { AgentStatus, AgentType, AgentConfig, AgentMetrics, Agent, AgentLog, AgentAction, AgentError, ResourceUsage, GeographicBias, DemographicBias, TemporalBias, BiasMetrics, BiasAlert, BiasReport } from '@nurisk/sdk/agent'

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
 * @deprecated Use agentApi.getAgents() from @nurisk/sdk/agent instead
 */
export async function getAgents(): Promise<{
  id: string
  name: string
  type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'
  status: 'active' | 'idle' | 'error'
  currentTask?: string
  uptime: number
  actionsCount: number
  config: { enabled: boolean; model?: string; maxRetries?: number; timeout?: number; parameters?: Record<string, unknown> }
  metrics: { totalExecutions: number; successfulExecutions: number; failedExecutions: number; averageConfidence: number; averageProcessingTime: number; lastExecutedAt?: string }
  createdAt: string
  updatedAt?: string
}[]> {
  return agentApi.getAgents()
}

/**
 * Get agent by ID
 * @deprecated Use agentApi.getAgent() from @nurisk/sdk/agent instead
 */
export async function getAgent(id: string): Promise<{
  id: string
  name: string
  type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'
  status: 'active' | 'idle' | 'error'
  currentTask?: string
  uptime: number
  actionsCount: number
  config: { enabled: boolean; model?: string; maxRetries?: number; timeout?: number; parameters?: Record<string, unknown> }
  metrics: { totalExecutions: number; successfulExecutions: number; failedExecutions: number; averageConfidence: number; averageProcessingTime: number; lastExecutedAt?: string }
  createdAt: string
  updatedAt?: string
}> {
  return agentApi.getAgent(id)
}

/**
 * Update agent configuration
 * @deprecated Use agentApi.updateAgentConfig() from @nurisk/sdk/agent instead
 */
export async function updateAgentConfig(
  id: string,
  config: Partial<{ enabled: boolean; model?: string; maxRetries?: number; timeout?: number; parameters?: Record<string, unknown> }>
): Promise<{
  id: string
  name: string
  type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'
  status: 'active' | 'idle' | 'error'
  currentTask?: string
  uptime: number
  actionsCount: number
  config: { enabled: boolean; model?: string; maxRetries?: number; timeout?: number; parameters?: Record<string, unknown> }
  metrics: { totalExecutions: number; successfulExecutions: number; failedExecutions: number; averageConfidence: number; averageProcessingTime: number; lastExecutedAt?: string }
  createdAt: string
  updatedAt?: string
}> {
  return agentApi.updateAgentConfig(id, config)
}

/**
 * Toggle agent on/off
 * @deprecated Use agentApi.toggleAgent() from @nurisk/sdk/agent instead
 */
export async function toggleAgent(id: string, enabled: boolean): Promise<{
  id: string
  name: string
  type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'
  status: 'active' | 'idle' | 'error'
  currentTask?: string
  uptime: number
  actionsCount: number
  config: { enabled: boolean; model?: string; maxRetries?: number; timeout?: number; parameters?: Record<string, unknown> }
  metrics: { totalExecutions: number; successfulExecutions: number; failedExecutions: number; averageConfidence: number; averageProcessingTime: number; lastExecutedAt?: string }
  createdAt: string
  updatedAt?: string
}> {
  return agentApi.toggleAgent(id, enabled)
}

/**
 * Get agent logs
 * @deprecated Use agentApi.getAgentLogs() from @nurisk/sdk/agent instead
 */
export async function getAgentLogs(params?: {
  agentId?: string
  level?: 'info' | 'warn' | 'error'
  search?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}): Promise<{
  id: string
  agentId: string
  agentName: string
  level: 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, unknown>
  timestamp: string
}[]> {
  return agentApi.getAgentLogs(params)
}

/**
 * Get agent actions
 * @deprecated Use agentApi.getAgentActions() from @nurisk/sdk/agent instead
 */
export async function getAgentActions(
  agentId: string,
  limit = 10
): Promise<{
  id: string
  agentId: string
  action: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
  status: 'pending' | 'success' | 'error'
  confidence?: number
  processingTime?: number
  executedAt: string
}[]> {
  return agentApi.getAgentActions(agentId, limit)
}

/**
 * Get agent errors
 * @deprecated Use agentApi.getAgentErrors() from @nurisk/sdk/agent instead
 */
export async function getAgentErrors(
  agentId: string,
  limit = 10
): Promise<{
  id: string
  agentId: string
  error: string
  stack?: string
  context?: Record<string, unknown>
  occurredAt: string
}[]> {
  return agentApi.getAgentErrors(agentId, limit)
}

/**
 * Get agent resource usage
 * @deprecated Use agentApi.getAgentResourceUsage() from @nurisk/sdk/agent instead
 */
export async function getAgentResourceUsage(
  agentId: string,
  duration = 60
): Promise<{
  cpu: number
  memory: number
  timestamp: string
}[]> {
  return agentApi.getAgentResourceUsage(agentId, duration)
}

// =============================================================================
// API Functions - Bias Monitoring
// =============================================================================

/**
 * Get bias report
 * @deprecated Use agentApi.getBiasReport() from @nurisk/sdk/agent instead
 */
export async function getBiasReport(days = 30): Promise<{
  generatedAt: string
  period: { start: string; end: string }
  metrics: {
    geographic: { regionDistribution: Record<string, number>; regionResponseTimes: Record<string, number>; regionAccuracy: Record<string, number>; underservedRegions: string[]; biasScore: number }
    demographic: { ageDistribution: Record<string, number>; genderDistribution: Record<string, number>; socioeconomicBias: Record<string, number>; accessibilityScore: number; biasScore: number }
    temporal: { hourlyDistribution: Record<string, number>; dailyDistribution: Record<string, number>; seasonalTrends: Record<string, number>; responseTimeByHour: Record<string, number>; biasScore: number }
  }
  alerts: { id: string; type: 'geographic' | 'demographic' | 'temporal'; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; message: string; details: Record<string, unknown>; detectedAt: string }[]
  recommendations: string[]
}> {
  return agentApi.getBiasReport(days)
}

/**
 * Get bias alerts
 * @deprecated Use agentApi.getBiasAlerts() from @nurisk/sdk/agent instead
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
 * @deprecated Use agentApi.getBiasMetrics() from @nurisk/sdk/agent instead
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
 * @deprecated Use agentApi.getAgentStatusColor() from @nurisk/sdk/agent instead
 */
export function getAgentStatusColor(status: 'active' | 'idle' | 'error'): string {
  return agentApi.getAgentStatusColor(status)
}

/**
 * Get agent status label
 * @deprecated Use agentApi.getAgentStatusLabel() from @nurisk/sdk/agent instead
 */
export function getAgentStatusLabel(status: 'active' | 'idle' | 'error'): string {
  return agentApi.getAgentStatusLabel(status)
}

/**
 * Get agent type label
 * @deprecated Use agentApi.getAgentTypeLabel() from @nurisk/sdk/agent instead
 */
export function getAgentTypeLabel(type: 'classifier' | 'predictor' | 'recommender' | 'analyzer'): string {
  return agentApi.getAgentTypeLabel(type)
}

/**
 * Format uptime
 * @deprecated Use agentApi.formatUptime() from @nurisk/sdk/agent instead
 */
export function formatUptime(seconds: number): string {
  return agentApi.formatUptime(seconds)
}

/**
 * Get bias severity color
 * @deprecated Use agentApi.getBiasSeverityColor() from @nurisk/sdk/agent instead
 */
export function getBiasSeverityColor(severity: string): string {
  return agentApi.getBiasSeverityColor(severity)
}

/**
 * Get bias score color
 * @deprecated Use agentApi.getBiasScoreColor() from @nurisk/sdk/agent instead
 */
export function getBiasScoreColor(score: number): string {
  return agentApi.getBiasScoreColor(score)
}