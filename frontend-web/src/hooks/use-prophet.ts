/**
 * useProphet Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery } from '@tanstack/react-query';
import { ProphetApi } from '@nurisk/sdk';
import type { ForecastRequest, ForecastSummary, SeasonalComponent, AnomalyPoint } from '@nurisk/shared-types/forecast';

// SDK instance
const prophetApi = new ProphetApi();

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get forecast data
 */
export function useForecast(request: ForecastRequest) {
  return useQuery({
    queryKey: ['prophet', 'forecast', request],
    queryFn: () => prophetApi.getForecast(request),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get multi-metric forecast
 */
export function useMultiMetricForecast(
  metrics: string[],
  period: ForecastRequest['period']
) {
  return useQuery({
    queryKey: ['prophet', 'multi', metrics, period],
    queryFn: () => prophetApi.getMultiMetricForecast(metrics, period),
    staleTime: 15 * 60 * 1000,
    enabled: metrics.length > 0,
  });
}

/**
 * Get seasonal decomposition
 */
export function useSeasonalDecomposition(
  metric: string,
  period: ForecastRequest['period']
) {
  return useQuery({
    queryKey: ['prophet', 'seasonal', metric, period],
    queryFn: () => prophetApi.getSeasonalDecomposition(metric, period),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Get anomaly detection
 */
export function useAnomalies(
  metric: string,
  period: ForecastRequest['period']
) {
  return useQuery({
    queryKey: ['prophet', 'anomalies', metric, period],
    queryFn: () => prophetApi.getAnomalies(metric, period),
    staleTime: 15 * 60 * 1000,
  });
}

// =============================================================================
// Derived Hooks
// =============================================================================

/**
 * Get forecast with anomalies highlighted
 */
export function useForecastWithAnomalies(request: ForecastRequest) {
  const { data, ...rest } = useForecast(request);

  const dataWithAnomalies = data?.dataPoints.map((point, _index) => {
    const anomaly = data.anomalies.find((a) => a.date === point.date);
    return {
      ...point,
      isAnomaly: anomaly?.anomaly ?? false,
    };
  }) ?? [];

  return {
    ...rest,
    data: data
      ? {
          ...data,
          dataPoints: dataWithAnomalies,
        }
      : undefined,
  };
}

/**
 * Get forecast accuracy metrics
 */
export function useForecastAccuracy(request: ForecastRequest) {
  const { data } = useForecast(request);

  if (!data?.accuracy) {
    return { mae: 0, rmse: 0, mape: 0 };
  }

  return data.accuracy;
}

// =============================================================================
// Export types
// =============================================================================

export type { ForecastRequest, ForecastSummary, SeasonalComponent, AnomalyPoint };