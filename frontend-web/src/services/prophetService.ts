// Prophet Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { ProphetApi } from '@nurisk/sdk/prophet'
import type { ForecastDataPoint, AnomalyPoint, SeasonalComponent } from '@nurisk/shared-types/forecast'

export type { ForecastDataPoint, AnomalyPoint, SeasonalComponent }

// Create SDK instance
const prophetApi = new ProphetApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getForecast = (metric: string, horizon?: number) => prophetApi.getForecast(metric, horizon)
export const getAnomalies = (metric: string) => prophetApi.getAnomalies(metric)
export const getSeasonalComponents = (metric: string) => prophetApi.getSeasonalComponents(metric)

// Utility functions
export const formatForecastValue = (value: number, metric: string): string => {
  if (metric.includes('temperature')) return `${value.toFixed(1)}°C`
  if (metric.includes('count') || metric.includes('incidents')) return value.toFixed(0)
  return value.toFixed(2)
}

export const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.9) return 'High'
  if (confidence >= 0.7) return 'Medium'
  return 'Low'
}