/**
 * NURisk SDK - Stream Analytics API
 * Real-time streaming data analytics with WebSocket support
 */
import type {
  StreamDataPoint,
  WindowAggregate,
  ThresholdAlert,
  StreamWindow,
  StreamFilters,
  StreamAnalytics,
} from '@nurisk/shared-types/stream-analytics'

export type { StreamWindow, StreamFilters, StreamAnalytics } from '@nurisk/shared-types/stream-analytics'

export interface StreamAnalyticsApiConfig {
  baseUrl: string
  wsUrl?: string
}

export class StreamAnalyticsApi {
  private baseUrl: string
  private wsUrl: string
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private streamCallback: ((data: StreamDataPoint) => void) | null = null
  private currentMetric: string | null = null

  constructor(config: StreamAnalyticsApiConfig) {
    this.baseUrl = config.baseUrl
    this.wsUrl = config.wsUrl ?? 'ws://localhost:3001'
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
      throw new Error(`StreamAnalyticsApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get stream analytics data
   */
  async getStreamAnalytics(filters: StreamFilters): Promise<StreamAnalytics> {
    const params = new URLSearchParams()
    params.append('metric', filters.metric)
    params.append('window', filters.window)
    if (filters.limit) params.append('limit', String(filters.limit))

    return this.request<StreamAnalytics>(`/analytics/stream?${params.toString()}`)
  }

  /**
   * Get window aggregates
   */
  async getWindowAggregates(
    metric: string,
    windows: StreamWindow[]
  ): Promise<WindowAggregate[]> {
    const params = new URLSearchParams()
    params.append('metric', metric)
    params.append('windows', windows.join(','))

    return this.request<WindowAggregate[]>(`/analytics/stream/aggregates?${params.toString()}`)
  }

  /**
   * Get threshold alerts
   */
  async getThresholdAlerts(metric: string): Promise<ThresholdAlert[]> {
    const params = new URLSearchParams()
    params.append('metric', metric)

    return this.request<ThresholdAlert[]>(`/analytics/stream/alerts?${params.toString()}`)
  }

  /**
   * Set threshold alert
   */
  async setThresholdAlert(
    metric: string,
    threshold: number,
    direction: 'above' | 'below'
  ): Promise<ThresholdAlert> {
    return this.request<ThresholdAlert>(`/analytics/stream/alerts`, {
      method: 'POST',
      body: JSON.stringify({ metric, threshold, direction }),
    })
  }

  /**
   * Remove threshold alert
   */
  async removeThresholdAlert(alertId: string): Promise<void> {
    await this.request<void>(`/analytics/stream/alerts/${alertId}`, {
      method: 'DELETE',
    })
  }

  // =============================================================================
  // WebSocket Connection
  // =============================================================================

  /**
   * Connect to stream WebSocket
   */
  connectStream(metric: string, callback: (data: StreamDataPoint) => void): void {
    this.streamCallback = callback
    this.currentMetric = metric

    // Close existing connection
    if (this.ws) {
      this.ws.close()
    }

    const wsUrl = `${this.wsUrl}/analytics/stream/${metric}`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        console.log('Stream connected:', metric)
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StreamDataPoint
          if (this.streamCallback) {
            this.streamCallback(data)
          }
        } catch (error) {
          console.error('Stream message parse error:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('Stream error:', error)
      }

      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.streamCallback) {
          this.reconnectAttempts++
          setTimeout(() => {
            if (this.currentMetric && this.streamCallback) {
              this.connectStream(this.currentMetric, this.streamCallback)
            }
          }, 1000 * Math.pow(2, this.reconnectAttempts))
        }
      }
    } catch (error) {
      console.error('Stream connection error:', error)
    }
  }

  /**
   * Disconnect from stream
   */
  disconnectStream(): void {
    this.streamCallback = null
    this.reconnectAttempts = this.maxReconnectAttempts
    this.currentMetric = null

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Calculate running total
   */
  calculateRunningTotal(dataPoints: StreamDataPoint[]): number {
    return dataPoints.reduce((sum, point) => sum + point.value, 0)
  }

  /**
   * Calculate window aggregate
   */
  calculateWindowAggregate(
    dataPoints: StreamDataPoint[],
    windowMs: number
  ): WindowAggregate {
    const now = Date.now()
    const windowStart = now - windowMs

    const windowPoints = dataPoints.filter(
      (p) => new Date(p.timestamp).getTime() >= windowStart
    )

    if (windowPoints.length === 0) {
      return {
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(now).toISOString(),
        metric: dataPoints[0]?.metric ?? '',
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
      }
    }

    const values = windowPoints.map((p) => p.value)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      windowStart: new Date(windowStart).toISOString(),
      windowEnd: new Date(now).toISOString(),
      metric: windowPoints[0].metric,
      count: windowPoints.length,
      sum,
      avg: sum / windowPoints.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  /**
   * Check threshold
   */
  checkThreshold(value: number, threshold: number, direction: 'above' | 'below'): boolean {
    if (direction === 'above') {
      return value > threshold
    }
    return value < threshold
  }

  /**
   * Format stream value
   */
  formatStreamValue(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

  /**
   * Get window label
   */
  getWindowLabel(window: StreamWindow): string {
    switch (window) {
      case '5m':
        return '5 Menit'
      case '15m':
        return '15 Menit'
      case '1h':
        return '1 Jam'
    }
  }

  /**
   * Get window milliseconds
   */
  getWindowMs(window: StreamWindow): number {
    switch (window) {
      case '5m':
        return 5 * 60 * 1000
      case '15m':
        return 15 * 60 * 1000
      case '1h':
        return 60 * 60 * 1000
    }
  }
}