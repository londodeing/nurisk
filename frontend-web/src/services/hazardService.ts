// Hazard Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import {
  HazardApi,
  type HazardType,
  type SeverityLevel,
  type VulnerabilityHeatmapData,
  type HazardStats,
  type VulnerabilityScore,
} from '@nurisk/sdk/hazard'

export type {
  HazardType,
  SeverityLevel,
  VulnerabilityHeatmapData,
  HazardStats,
  VulnerabilityScore,
}

// Helper functions for UI components
export const getSeverityColor = (severity: SeverityLevel) => {
  const colors: Record<SeverityLevel, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  }
  return colors[severity]
}

export const getSeverityLabel = (severity: SeverityLevel) => {
  const labels: Record<SeverityLevel, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  }
  return labels[severity]
}

// Mock data for development
export const MOCK_HAZARD_ZONES: any[] = []

export const MOCK_VULNERABILITY_DATA: any[] = []

// Create SDK instance
const hazardApi = new HazardApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getHazardTypes = () => hazardApi.getHazardTypes()
export const getHazardTypeById = (id: string) => hazardApi.getHazardTypeById(id)
export const getHazardZones = () => hazardApi.getHazardZones()
export const getHazardZoneById = (id: string) => hazardApi.getHazardZoneById(id)
export const getHazardZonesByType = (typeId: string) => hazardApi.getHazardZonesByType(typeId)
export const getVulnerabilityHeatmap = () => hazardApi.getVulnerabilityHeatmap()
export const getHazardStats = () => hazardApi.getHazardStats()
export const getVulnerabilityScore = (zoneId: string) => hazardApi.getVulnerabilityScore(zoneId)