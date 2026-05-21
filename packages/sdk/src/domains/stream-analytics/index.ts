// Stream Analytics Domain - Analytics (NON-CRUD)
import { client } from '../../core/client'
import type { StreamDataPoint, WindowAggregate, ThresholdAlert, StreamFilters, StreamWindow } from '@nurisk/shared-types/stream-analytics'

export const streamAnalyticsApi = {
  getStream: (filters: StreamFilters): Promise<{
    metric: string
    window: string
    dataPoints: StreamDataPoint[]
    windowAggregates: WindowAggregate[]
    runningTotal: number
    thresholdAlerts: ThresholdAlert[]
    lastUpdated: number
  }> =>
    client
      .get<{
        metric: string
        window: string
        dataPoints: StreamDataPoint[]
        windowAggregates: WindowAggregate[]
        runningTotal: number
        thresholdAlerts: ThresholdAlert[]
        lastUpdated: number
      }>('/api/v1/stream-analytics', { params: filters })
      .then((res) => res.data!),

  getWindowAggregates: (
    metric: string,
    windows: ('5m' | '15m' | '1h')[]
  ): Promise<WindowAggregate[]> =>
    client
      .get<WindowAggregate[]>('/api/v1/stream-analytics/aggregates', {
        params: { metric, windows: windows.join(',') },
      })
      .then((res) => res.data!),

  getAlerts: (metric: string): Promise<ThresholdAlert[]> =>
    client
      .get<ThresholdAlert[]>('/api/v1/stream-analytics/alerts', { params: { metric } })
      .then((res) => res.data!),

  setAlert: (
    metric: string,
    threshold: number,
    direction: 'above' | 'below'
  ): Promise<ThresholdAlert> =>
    client
      .post<ThresholdAlert>('/api/v1/stream-analytics/alerts', { metric, threshold, direction })
      .then((res) => res.data!),

  removeAlert: (alertId: string): Promise<void> =>
    client
      .delete<void>(`/api/v1/stream-analytics/alerts/${alertId}`)
      .then((res) => res.data!),
}