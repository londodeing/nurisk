// Stream Analytics Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { StreamAnalyticsApi } from '@nurisk/sdk'
import type {
  StreamDataPoint,
  WindowAggregate,
  ThresholdAlert,
  StreamAnalytics,
  StreamFilters,
  StreamWindow,
} from '@nurisk/shared-types/stream-analytics'

export type {
  StreamDataPoint,
  WindowAggregate,
  ThresholdAlert,
  StreamAnalytics,
  StreamFilters,
  StreamWindow,
}

// Create SDK instance
const streamAnalyticsApi = new StreamAnalyticsApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getStreamData = (metric: string, filters?: StreamFilters) =>
  streamAnalyticsApi.getStreamData(metric, filters)
export const getWindowAggregates = (metric: string, window: StreamWindow) =>
  streamAnalyticsApi.getWindowAggregates(metric, window)
export const getThresholdAlerts = (metric?: string) => streamAnalyticsApi.getThresholdAlerts(metric)
export const getStreamAnalytics = (metric: string) => streamAnalyticsApi.getStreamAnalytics(metric)

// Utility functions
export const formatStreamValue = (value: number, metric: string): string => {
  if (metric.includes('temperature')) return `${value.toFixed(1)}°C`
  if (metric.includes('humidity')) return `${value.toFixed(0)}%`
  if (metric.includes('pressure')) return `${value.toFixed(0)} hPa`
  return value.toFixed(2)
}

export const getWindowLabel = (window: StreamWindow): string => {
  const labels: Record<StreamWindow, string> = {
    '1m': 'Last Minute',
    '5m': 'Last 5 Minutes',
    '15m': 'Last 15 Minutes',
    '1h': 'Last Hour',
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
  }
  return labels[window] ?? window
}