/**
 * NURisk SDK - Prophet API
 * Time-series forecasting using Prophet model
 */
import type { ForecastDataPoint, SeasonalComponent, AnomalyPoint } from '@nurisk/shared-types/forecast'

export interface ForecastSummary {
  metric: string
  period: string
  startDate: string
  endDate: string
  dataPoints: ForecastDataPoint[]
  seasonal: SeasonalComponent[]
  anomalies: AnomalyPoint[]
  accuracy?: {
    mae: number
    rmse: number
    mape: number
  }
}

export interface ForecastRequest {
  metric: string
  period: '7d' | '14d' | '30d' | '90d'
  history?: number
}

export interface ProphetApiConfig {
  baseUrl?: string
}

export class ProphetApi {
  private baseUrl: string

  constructor(config: ProphetApiConfig = {}) {
    this.baseUrl = config.baseUrl ?? '/api'
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
      throw new Error(`ProphetApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get forecast data
   */
  async getForecast(request: ForecastRequest): Promise<ForecastSummary> {
    const params = new URLSearchParams()
    params.append('metric', request.metric)
    params.append('period', request.period)
    if (request.history) params.append('history', String(request.history))

    return this.request<ForecastSummary>(`/analytics/forecast?${params.toString()}`)
  }

  /**
   * Get multiple metrics forecast
   */
  async getMultiMetricForecast(
    metrics: string[],
    period: ForecastRequest['period']
  ): Promise<ForecastSummary[]> {
    const results = await Promise.all(
      metrics.map((metric) => this.getForecast({ metric, period }))
    )
    return results
  }

  /**
   * Get seasonal decomposition
   */
  async getSeasonalDecomposition(
    metric: string,
    period: ForecastRequest['period']
  ): Promise<SeasonalComponent[]> {
    const forecast = await this.getForecast({ metric, period })
    return forecast.seasonal
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalies(
    metric: string,
    period: ForecastRequest['period']
  ): Promise<AnomalyPoint[]> {
    const forecast = await this.getForecast({ metric, period })
    return forecast.anomalies
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Calculate forecast accuracy metrics
   */
  calculateAccuracy(
    actual: number[],
    predicted: number[]
  ): { mae: number; rmse: number; mape: number } {
    if (actual.length !== predicted.length || actual.length === 0) {
      return { mae: 0, rmse: 0, mape: 0 }
    }

    let sumAbsError = 0
    let sumSquaredError = 0
    let sumPercentError = 0
    let validCount = 0

    for (let i = 0; i < actual.length; i++) {
      const error = Math.abs(actual[i] - predicted[i])
      sumAbsError += error
      sumSquaredError += error * error

      if (actual[i] !== 0) {
        sumPercentError += (error / actual[i]) * 100
        validCount++
      }
    }

    const mae = sumAbsError / actual.length
    const rmse = Math.sqrt(sumSquaredError / actual.length)
    const mape = validCount > 0 ? sumPercentError / validCount : 0

    return { mae, rmse, mape }
  }

  /**
   * Get confidence level label
   */
  getConfidenceLabel(lower: number, upper: number): string {
    const range = upper - lower
    if (range < 10) return 'Very High'
    if (range < 20) return 'High'
    if (range < 30) return 'Medium'
    return 'Low'
  }

  /**
   * Format forecast value
   */
  formatForecastValue(value: number): string {
    if (value < 0) return '0'
    return Math.round(value).toLocaleString('id-ID')
  }
}