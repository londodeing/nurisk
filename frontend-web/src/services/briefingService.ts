// Briefing Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import {
  BriefingApi,
} from '@nurisk/sdk/briefing'

import type {
  ExecutiveBriefing,
  SituationSummary,
  KeyMetrics,
  RecommendedAction,
  IncidentBrief,
} from '@nurisk/shared-types/briefing'

export type {
  ExecutiveBriefing,
  SituationSummary,
  KeyMetrics,
  RecommendedAction,
  IncidentBrief,
}

export type RegionStatus = 'normal' | 'watch' | 'warning' | 'emergency'

// Create SDK instance
const briefingApi = new BriefingApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const generateBriefing = () => briefingApi.generateBriefing()
export const getBriefingById = (id: string) => briefingApi.getBriefingById(id)
export const getIncidentBriefs = () => briefingApi.getIncidentBriefs()
export const getRecommendations = () => briefingApi.getRecommendations()

// Utility functions
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    normal: '#22c55e',
    watch: '#f59e0b',
    warning: '#f97316',
    emergency: '#ef4444',
  }
  return colors[status] ?? '#6b7280'
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    normal: 'Normal',
    watch: 'Watch',
    warning: 'Warning',
    emergency: 'Emergency',
  }
  return labels[status] ?? status
}

export const getRegionStatusColor = (status: RegionStatus): string => {
  const colors: Record<RegionStatus, string> = {
    normal: '#22c55e',
    watch: '#f59e0b',
    warning: '#f97316',
    emergency: '#ef4444',
  }
  return colors[status] ?? '#6b7280'
}

export const getPriorityColor = (priority: RecommendedAction['priority']): string => {
  const colors: Record<RecommendedAction['priority'], string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return colors[priority] ?? '#6b7280'
}

export const getPriorityLabel = (priority: RecommendedAction['priority']): string => {
  const labels: Record<RecommendedAction['priority'], string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  }
  return labels[priority] ?? priority
}

export const getActionTypeLabel = (type: RecommendedAction['type']): string => {
  const labels: Record<RecommendedAction['type'], string> = {
    resource: 'Resource',
    coordination: 'Coordination',
    communication: 'Communication',
    evacuation: 'Evacuation',
  }
  return labels[type] ?? type
}

export const formatResponseTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

// Mock data for backward compatibility
export const MOCK_BRIEFING: ExecutiveBriefing = {
  id: 'brief-001',
  title: 'Daily Executive Briefing',
  summary: {
    overview: 'All systems operational',
    criticalIssues: [],
    ongoingOperations: [],
    resourceStatus: 'Adequate',
  },
  metrics: {
    totalIncidents: 0,
    activeIncidents: 0,
    totalVolunteers: 0,
    deployedVolunteers: 0,
    totalShelters: 0,
    availableCapacity: 0,
    resourcesDeployed: 0,
    affectedPopulation: 0,
    lastUpdated: new Date().toISOString(),
  },
  recommendations: [],
  generatedAt: new Date().toISOString(),
  validUntil: new Date(Date.now() + 3600000).toISOString(),
  preparedBy: 'System',
}

export const MOCK_INCIDENT_BRIEFS: IncidentBrief[] = []