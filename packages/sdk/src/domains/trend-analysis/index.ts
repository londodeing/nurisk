// Trend Analysis Domain - Analytics (NON-CRUD)
import { client } from '../../core/client'
import type { TrendDataPoint, MovingAverageData, ChangePoint, SeasonalPattern, TrendFilters, PeriodComparisonResult, PeriodComparison, MovingAverageWindow } from '@nurisk/shared-types/trend-analysis'

export const trendAnalysisApi = {
  analyze: (filters: TrendFilters): Promise<{
    metric: string
    period: string
    dataPoints: TrendDataPoint[]
    periodComparison: PeriodComparisonResult
    movingAverages: MovingAverageData[]
    changePoints: ChangePoint[]
  }> =>
    client
      .post<{
        metric: string
        period: string
        dataPoints: TrendDataPoint[]
        periodComparison: PeriodComparisonResult
        movingAverages: MovingAverageData[]
        changePoints: ChangePoint[]
      }>('/api/v1/trend-analysis/analyze', filters)
      .then((res) => res.data!),

  getReport: (id: string): Promise<{
    metric: string
    period: string
    dataPoints: TrendDataPoint[]
    periodComparison: PeriodComparisonResult
    movingAverages: MovingAverageData[]
    changePoints: ChangePoint[]
  }> =>
    client
      .get<{
        metric: string
        period: string
        dataPoints: TrendDataPoint[]
        periodComparison: PeriodComparisonResult
        movingAverages: MovingAverageData[]
        changePoints: ChangePoint[]
      }>(`/api/v1/trend-analysis/${id}`)
      .then((res) => res.data!),

  getPeriodComparison: (
    metric: string,
    comparison: 'yoy' | 'mom' | 'wow'
  ): Promise<PeriodComparisonResult> =>
    client
      .get<PeriodComparisonResult>('/api/v1/trend-analysis/comparison', {
        params: { metric, comparison },
      })
      .then((res) => res.data!),

  getMovingAverages: (
    metric: string,
    window: 7 | 14 | 30,
    period: TrendFilters['period']
  ): Promise<MovingAverageData[]> =>
    client
      .get<MovingAverageData[]>('/api/v1/trend-analysis/moving-average', {
        params: { metric, window: String(window), period },
      })
      .then((res) => res.data!),

  getChangePoints: (
    metric: string,
    period: TrendFilters['period']
  ): Promise<ChangePoint[]> =>
    client
      .get<ChangePoint[]>('/api/v1/trend-analysis/change-points', {
        params: { metric, period },
      })
      .then((res) => res.data!),

  getSeasonalPatterns: (metric: string): Promise<SeasonalPattern[]> =>
    client
      .get<SeasonalPattern[]>('/api/v1/trend-analysis/seasonal', {
        params: { metric },
      })
      .then((res) => res.data!),
}