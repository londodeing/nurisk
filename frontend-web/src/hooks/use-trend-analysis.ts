/**
 * useTrendAnalysis Hook
 * Trend analysis data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { TrendFilters, TrendAnalysis, PeriodComparisonResult, MovingAverageData, SeasonalPattern, ChangePoint, PeriodComparison, MovingAverageWindow } from '@nurisk/shared-types/trend-analysis';

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get trend analysis
 */
export function useTrendAnalysis(filters: TrendFilters) {
  return useQuery({
    queryKey: ['trend', 'analysis', filters],
    queryFn: () => sdk.trendAnalysis.getTrendAnalysis(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get period comparison
 */
export function usePeriodComparison(
  metric: string,
  comparison: PeriodComparison
) {
  return useQuery({
    queryKey: ['trend', 'comparison', metric, comparison],
    queryFn: () => sdk.trendAnalysis.getPeriodComparison(metric, comparison),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get moving averages
 */
export function useMovingAverages(
  metric: string,
  window: MovingAverageWindow,
  period: TrendFilters['period']
) {
  return useQuery({
    queryKey: ['trend', 'moving-average', metric, window, period],
    queryFn: () => sdk.trendAnalysis.getMovingAverages(metric, window, period),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get seasonal patterns
 * Note: SDK method available via TrendAnalysisApi class
 */
export function useSeasonalPatterns(metric: string) {
  return useQuery({
    queryKey: ['trend', 'seasonal', metric],
    queryFn: () => sdk.trendAnalysis.getSeasonalPatterns(metric),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Get change points
 */
export function useChangePoints(
  metric: string,
  period: TrendFilters['period']
) {
  return useQuery({
    queryKey: ['trend', 'change-points', metric, period],
    queryFn: () => sdk.trendAnalysis.getChangePoints(metric, period),
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Derived Hooks
// =============================================================================

/**
 * Get trend with moving average overlay
 */
export function useTrendWithMA(
  filters: TrendFilters,
  maWindow: MovingAverageWindow = 7
) {
  const { data: trendData, ...trendRest } = useTrendAnalysis(filters);
  const { data: maData, ...maRest } = useMovingAverages(
    filters.metric || 'incidents',
    maWindow,
    filters.period
  );

  const combinedData = trendData?.dataPoints.map((point, index) => ({
    ...point,
    movingAverage: maData?.[index]?.movingAverage ?? 0,
  })) || [];

  return {
    ...trendRest,
    ...maRest,
    data: trendData
      ? {
          ...trendData,
          dataPoints: combinedData,
        }
      : undefined,
  };
}

/**
 * Get YoY comparison
 */
export function useYoYComparison(metric: string) {
  return usePeriodComparison(metric, 'yoy');
}

/**
 * Get MoM comparison
 */
export function useMoMComparison(metric: string) {
  return usePeriodComparison(metric, 'mom');
}

/**
 * Get WoW comparison
 */
export function useWoWComparison(metric: string) {
  return usePeriodComparison(metric, 'wow');
}

// =============================================================================
// Export types
// =============================================================================

export type {
  TrendFilters,
  TrendAnalysis,
  PeriodComparisonResult,
  MovingAverageData,
  SeasonalPattern,
  ChangePoint,
  PeriodComparison,
  MovingAverageWindow,
};