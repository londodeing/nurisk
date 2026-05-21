export interface TrendDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface MovingAverageData {
  period: number;
  values: { timestamp: string; value: number }[];
}

export interface ChangePoint {
  index: number;
  timestamp: string;
  value: number;
  significance: number;
  type: 'mean_shift' | 'trend_change' | 'variance_change';
}

// =============================================================================
// Domain Types (Source of Truth)
// =============================================================================

export type PeriodComparison = 'yoy' | 'mom' | 'wow';
export type MovingAverageWindow = 7 | 14 | 30;

export interface PeriodComparisonResult {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SeasonalPattern {
  period: string;
  dayOfWeek?: number;
  month?: number;
  average: number;
  index: number;
}

export interface TrendFilters {
  metric?: string;
  period: '7d' | '30d' | '90d' | '1y';
  comparison?: PeriodComparison;
  movingAverage?: MovingAverageWindow;
}

export interface TrendAnalysis {
  metric: string;
  period: string;
  dataPoints: TrendDataPoint[];
  periodComparison: PeriodComparisonResult;
  movingAverages: MovingAverageData[];
  seasonalPatterns: SeasonalPattern[];
  changePoints: ChangePoint[];
}
