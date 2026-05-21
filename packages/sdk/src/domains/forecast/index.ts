// Forecast Domain - Analytics (NON-CRUD)
import { client } from '../../core/client'
import type { ForecastDataPoint, AnomalyPoint } from '@nurisk/shared-types/forecast'

export interface ForecastParams {
  metric: string
  period: string
  horizon?: number
}

export const forecastApi = {
  getForecast: (params: ForecastParams): Promise<{
    metric: string
    period: string
    dataPoints: ForecastDataPoint[]
    anomalies: AnomalyPoint[]
    generatedAt: string
  }> =>
    client
      .get<{
        metric: string
        period: string
        dataPoints: ForecastDataPoint[]
        anomalies: AnomalyPoint[]
        generatedAt: string
      }>('/api/v1/forecast', { params: params })
      .then((res) => res.data!),

  getAnomalies: (
    metric: string,
    period: string
  ): Promise<AnomalyPoint[]> =>
    client
      .get<AnomalyPoint[]>('/api/v1/forecast/anomalies', {
        params: { metric, period },
      })
      .then((res) => res.data!),

  getReport: (id: string): Promise<{
    metric: string
    period: string
    dataPoints: ForecastDataPoint[]
    anomalies: AnomalyPoint[]
    generatedAt: string
  }> =>
    client
      .get<{
        metric: string
        period: string
        dataPoints: ForecastDataPoint[]
        anomalies: AnomalyPoint[]
        generatedAt: string
      }>(`/api/v1/forecast/${id}`)
      .then((res) => res.data!),
}