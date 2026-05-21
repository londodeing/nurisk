export interface StreamDataPoint {
  timestamp: string;
  value: number;
  metric: string;
  source: string;
  tags?: Record<string, string>;
}

export interface WindowAggregate {
  windowStart: string;
  windowEnd: string;
  metric: string;
  avg: number;
  min: number;
  max: number;
  sum: number;
  count: number;
  stdDev?: number;
}

export interface ThresholdAlert {
  id: string;
  metric: string;
  threshold: number;
  actualValue: number;
  direction: 'above' | 'below';
  severity: 'info' | 'warning' | 'critical';
  triggeredAt: string;
  resolvedAt?: string;
}

// =============================================================================
// Domain Types (Source of Truth)
// =============================================================================

export type StreamWindow = '5m' | '15m' | '1h';

export interface StreamFilters {
  metric: string;
  window: StreamWindow;
  limit?: number;
}

export interface StreamAnalytics {
  metric: string;
  window: StreamWindow;
  dataPoints: StreamDataPoint[];
  windowAggregates: WindowAggregate[];
  runningTotal: number;
  thresholdAlerts: ThresholdAlert[];
  lastUpdated: number;
}
