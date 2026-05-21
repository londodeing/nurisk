// Risk Registry Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { RiskRegistryApi } from '@nurisk/sdk/risk-registry'
import type {
  Risk,
  RiskMatrixCell,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  RiskCategory,
  RiskFilters,
} from '@nurisk/shared-types/risk'

export type {
  Risk,
  RiskMatrixCell,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  RiskCategory,
  RiskFilters,
}

// Helper functions for UI components
export const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 20) return 'critical'
  if (score >= 12) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

export const getRiskLevelColor = (level: ReturnType<typeof getRiskLevel>) => {
  const colors: Record<ReturnType<typeof getRiskLevel>, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  }
  return colors[level]
}

export const getRiskLevelBgColor = (level: ReturnType<typeof getRiskLevel>) => {
  const colors: Record<ReturnType<typeof getRiskLevel>, string> = {
    low: '#dcfce7',
    medium: '#fef9c3',
    high: '#ffedd5',
    critical: '#fee2e2'
  }
  return colors[level]
}

export const getLikelihoodLabel = (likelihood: RiskLikelihood) => {
  const labels: Record<RiskLikelihood, string> = {
    rare: 'Rare',
    unlikely: 'Unlikely',
    possible: 'Possible',
    likely: 'Likely',
    certain: 'Certain'
  }
  return labels[likelihood]
}

export const getImpactLabel = (impact: RiskImpact) => {
  const labels: Record<RiskImpact, string> = {
    negligible: 'Negligible',
    minor: 'Minor',
    moderate: 'Moderate',
    major: 'Major',
    catastrophic: 'Catastrophic'
  }
  return labels[impact]
}

export const getStatusLabel = (status: RiskStatus) => {
  const labels: Record<RiskStatus, string> = {
    identified: 'Identified',
    assessing: 'Assessing',
    treating: 'Treating',
    monitoring: 'Monitoring',
    closed: 'Closed'
  }
  return labels[status]
}

export const getStatusColor = (status: RiskStatus) => {
  const colors: Record<RiskStatus, string> = {
    identified: '#3b82f6',
    assessing: '#f59e0b',
    treating: '#f97316',
    monitoring: '#8b5cf6',
    closed: '#22c55e'
  }
  return colors[status]
}

export const getCategoryLabel = (category: RiskCategory) => {
  const labels: Record<RiskCategory, string> = {
    operational: 'Operational',
    strategic: 'Strategic',
    financial: 'Financial',
    compliance: 'Compliance',
    reputational: 'Reputational'
  }
  return labels[category]
}

export const formatRiskScore = (score: number) => score.toFixed(1)

// Create SDK instance
const riskRegistryApi = new RiskRegistryApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getRisks = (filters?: RiskFilters) => riskRegistryApi.getRisks(filters)
export const getRiskById = (id: string) => riskRegistryApi.getRiskById(id)
export const createRisk = (data: Parameters<typeof riskRegistryApi.createRisk>[0]) => riskRegistryApi.createRisk(data)
export const updateRisk = (id: string, data: Parameters<typeof riskRegistryApi.updateRisk>[1]) => riskRegistryApi.updateRisk(id, data)
export const deleteRisk = (id: string) => riskRegistryApi.deleteRisk(id)
export const getRiskMatrix = () => riskRegistryApi.getRiskMatrix()
export const getRiskSummary = () => riskRegistryApi.getRiskSummary()