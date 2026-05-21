/**
 * useStreamAnalytics Hook
 * Real-time stream analytics with auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { StreamFilters, StreamAnalytics, StreamDataPoint, WindowAggregate, ThresholdAlert, StreamWindow } from '@nurisk/shared-types/stream-analytics';

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get stream analytics data
 */
export function useStreamAnalytics(filters: StreamFilters) {
  return useQuery({
    queryKey: ['stream', 'analytics', filters],
    queryFn: () => sdk.streamAnalytics.getStream(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

/**
 * Get window aggregates
 */
export function useWindowAggregates(
  metric: string,
  windows: StreamWindow[]
) {
  return useQuery({
    queryKey: ['stream', 'aggregates', metric, windows],
    queryFn: () => sdk.streamAnalytics.getWindowAggregates(metric, windows),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Get threshold alerts
 */
export function useThresholdAlerts(metric: string) {
  return useQuery({
    queryKey: ['stream', 'alerts', metric],
    queryFn: () => sdk.streamAnalytics.getAlerts(metric),
    staleTime: 10 * 1000,
  });
}

/**
 * Set threshold alert mutation
 */
export function useSetThresholdAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      metric,
      threshold,
      direction,
    }: {
      metric: string;
      threshold: number;
      direction: 'above' | 'below';
    }) => sdk.streamAnalytics.setAlert(metric, threshold, direction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['stream', 'alerts', variables.metric],
      });
    },
  });
}

/**
 * Remove threshold alert mutation
 */
export function useRemoveThresholdAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => sdk.streamAnalytics.removeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream', 'alerts'] });
    },
  });
}

// =============================================================================
// Real-time Hook
// =============================================================================

/**
 * Real-time stream hook with WebSocket
 */
export function useRealTimeStream(metric: string) {
  const [dataPoints, setDataPoints] = useState<StreamDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: StreamDataPoint) => void) | null>(null);

  const handleData = useCallback((data: StreamDataPoint) => {
    setDataPoints((prev) => {
      const newPoints = [...prev, data];
      // Keep last 100 points
      return newPoints.slice(-100);
    });
  }, []);

  useEffect(() => {
    callbackRef.current = handleData;
    sdk.streamAnalytics.connectStream(metric, handleData);
    setIsConnected(true);

    return () => {
      sdk.streamAnalytics.disconnectStream();
      setIsConnected(false);
    };
  }, [metric, handleData]);

  const runningTotal = sdk.streamAnalytics.calculateRunningTotal(dataPoints);

  return {
    dataPoints,
    runningTotal,
    isConnected,
  };
}

// =============================================================================
// Derived Hooks
// =============================================================================

/**
 * Get stream with window aggregates
 */
export function useStreamWithAggregates(filters: StreamFilters) {
  const { data: streamData, ...streamRest } = useStreamAnalytics(filters);
  const { data: aggregateData } = useWindowAggregates(filters.metric, ['5m', '15m', '1h']);

  const aggregates: Record<StreamWindow, WindowAggregate> = {
    '5m': sdk.streamAnalytics.calculateWindowAggregate(
      streamData?.dataPoints || [],
      sdk.streamAnalytics.getWindowMs('5m')
    ),
    '15m': sdk.streamAnalytics.calculateWindowAggregate(
      streamData?.dataPoints || [],
      sdk.streamAnalytics.getWindowMs('15m')
    ),
    '1h': sdk.streamAnalytics.calculateWindowAggregate(
      streamData?.dataPoints || [],
      sdk.streamAnalytics.getWindowMs('1h')
    ),
  };

  return {
    ...streamRest,
    data: streamData
      ? {
          ...streamData,
          windowAggregates: aggregateData ?? Object.values(aggregates),
          runningTotal: streamData.runningTotal,
        }
      : undefined,
  };
}

/**
 * Get stream with alerts
 */
export function useStreamWithAlerts(filters: StreamFilters) {
  const { data: streamData, ...streamRest } = useStreamAnalytics(filters);
  const { data: alerts } = useThresholdAlerts(filters.metric);

  const triggeredAlerts = alerts?.filter((a: any) => a.triggered) || [];

  return {
    ...streamRest,
    data: streamData
      ? {
          ...streamData,
          thresholdAlerts: triggeredAlerts,
        }
      : undefined,
    alerts: triggeredAlerts,
  };
}

// =============================================================================
// Export types
// =============================================================================

export type {
  StreamFilters,
  StreamAnalytics,
  StreamDataPoint,
  WindowAggregate,
  ThresholdAlert,
  StreamWindow,
};