/**
 * NURisk SDK - Trend Analysis API
 * Centralized HTTP transport for trend analysis endpoints
 */
import type {
  TrendDataPoint,
  MovingAverageData,
  ChangePoint,
  PeriodComparison,
  MovingAverageWindow,
  PeriodComparisonResult,
  SeasonalPattern,
  TrendFilters,
  TrendAnalysis,
} from '@nurisk/shared-types/trend-analysis'

export type {
  PeriodComparison,
  MovingAverageWindow,
  PeriodComparisonResult,
  SeasonalPattern,
  TrendFilters,
  TrendAnalysis,
} from '@nurisk/shared-types/trend-analysis'

export interface TrendAnalysisApiConfig {
  baseUrl: string
}

export class TrendAnalysisApi {
  private baseUrl: string

  constructor(config: TrendAnalysisApiConfig) {
    this.baseUrl = config.baseUrl
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`TrendAnalysisApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get trend analysis data
   */
  async getTrendAnalysis(filters: TrendFilters): Promise<TrendAnalysis> {
    const params: Record<string, string> = {
      period: filters.period,
    }
    if (filters.metric) params.metric = filters.metric
    if (filters.comparison) params.comparison = filters.comparison
    if (filters.movingAverage) params.ma = String(filters.movingAverage)

    return this.request<TrendAnalysis>('/analytics/trend', params)
  }

  /**
   * Get period comparison
   */
  async getPeriodComparison(
    metric: string,
    comparison: PeriodComparison
  ): Promise<PeriodComparisonResult> {
    return this.request<PeriodComparisonResult>('/analytics/trend/comparison', {
      metric,
      comparison,
    })
  }

  /**
   * Get moving averages
   */
  async getMovingAverages(
    metric: string,
    window: MovingAverageWindow,
    period: TrendFilters['period']
  ): Promise<MovingAverageData[]> {
    return this.request<MovingAverageData[]>('/analytics/trend/moving-average', {
      metric,
      window: String(window),
      period,
    })
  }

  /**
   * Get seasonal patterns
   */
  async getSeasonalPatterns(metric: string): Promise<SeasonalPattern[]> {
    return this.request<SeasonalPattern[]>('/analytics/trend/seasonal', { metric })
  }

  /**
   * Get change points
   */
  async getChangePoints(
    metric: string,
    period: TrendFilters['period']
  ): Promise<ChangePoint[]> {
    return this.request<ChangePoint[]>('/analytics/trend/change-points', {
      metric,
      period,
    })
  }

  // =============================================================================
  // Utility Functions (client-side calculations)
  // =============================================================================

  /**
   * Calculate moving average
   */
  calculateMovingAverage(values: number[], window: number): number[] {
    if (values.length < window) {
      return values.map(() => 0)
    }

    const result: number[] = []
    for (let i = 0; i < values.length; i++) {
      if (i < window - 1) {
        result.push(0)
      } else {
        const slice = values.slice(i - window + 1, i + 1)
        const avg = slice.reduce((a, b) => a + b, 0) / window
        result.push(avg)
      }
    }
    return result
  }

  /**
   * Detect trend direction
   */
  detectTrend(current: number, previous: number, threshold = 5): 'up' | 'down' | 'stable' {
    const changePercent = ((current - previous) / previous) * 100

    if (changePercent > threshold) return 'up'
    if (changePercent < -threshold) return 'down'
    return 'stable'
  }

  /**
   * Format change value
   */
  formatChange(change: number, changePercent: number): string {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toLocaleString('id-ID')} (${sign}${changePercent.toFixed(1)}%)`
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      default:
        return '→'
    }
  }

  /**
   * Get trend color
   */
  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '#16a34a'
      case 'down':
        return '#dc2626'
      default:
        return '#64748b'
    }
  }

  /**
   * Calculate period over period change
   */
  calculatePoPChange(current: number[], previous: number[]): PeriodComparisonResult {
    const currentSum = current.reduce((a, b) => a + b, 0)
    const previousSum = previous.reduce((a, b) => a + b, 0)
    const change = currentSum - previousSum
    const changePercent = previousSum !== 0 ? (change / previousSum) * 100 : 0

    return {
      current: currentSum,
      previous: previousSum,
      change,
      changePercent,
      trend: this.detectTrend(currentSum, previousSum),
    }
  }
}