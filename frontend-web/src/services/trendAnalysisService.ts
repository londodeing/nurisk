// Trend Analysis Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { TrendAnalysisApi } from '@nurisk/sdk/trend-analysis'
import type {
  TrendDataPoint,
  MovingAverageData,
  ChangePoint,
  TrendAnalysis,
  TrendFilters,
  PeriodComparisonResult,
  SeasonalPattern,
  PeriodComparison,
  MovingAverageWindow,
} from '@nurisk/shared-types/trend-analysis'

export type {
  TrendDataPoint,
  MovingAverageData,
  ChangePoint,
  TrendAnalysis,
  TrendFilters,
  PeriodComparisonResult,
  SeasonalPattern,
  PeriodComparison,
  MovingAverageWindow,
}

// Create SDK instance
const trendAnalysisApi = new TrendAnalysisApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getTrendData = (metric: string, filters?: TrendFilters) => trendAnalysisApi.getTrendData(metric, filters)
export const getMovingAverage = (metric: string, window: MovingAverageWindow) =>
  trendAnalysisApi.getMovingAverage(metric, window)
export const getChangePoints = (metric: string) => trendAnalysisApi.getChangePoints(metric)
export const getPeriodComparison = (metric: string, comparison: PeriodComparison) =>
  trendAnalysisApi.getPeriodComparison(metric, comparison)
export const getSeasonalPattern = (metric: string) => trendAnalysisApi.getSeasonalPattern(metric)
export const getTrendAnalysis = (metric: string) => trendAnalysisApi.getTrendAnalysis(metric)

// Utility functions
export const formatChange = (current: number, previous: number): string => {
  if (previous === 0) return '+∞%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export const getTrendIcon = (change: number): string => {
  if (change > 0) return '↑'
  if (change < 0) return '↓'
  return '→'
}

export const getTrendColor = (change: number): string => {
  if (change > 0) return '#22c55e'
  if (change < 0) return '#ef4444'
  return '#6b7280'
}