// =============================================================================
// Forecast Data Point
// =============================================================================

export interface ForecastDataPoint {
  timestamp: string;
  actual?: number;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

// =============================================================================
// Seasonal Component
// =============================================================================

export interface SeasonalComponent {
  period: number;
  amplitude: number;
  phase: number;
  type: 'weekly' | 'monthly' | 'yearly';
}

// =============================================================================
// Anomaly Point
// =============================================================================

export interface AnomalyPoint {
  timestamp: string;
  actual: number;
  expected: number;
  deviation: number;
  severity: 'minor' | 'major' | 'critical';
  metric: string;
}

// =============================================================================
// Forecast Request
// =============================================================================

export interface ForecastRequest {
  metric: string;
  startDate: string;
  endDate: string;
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  covariates?: string[];
}

// =============================================================================
// Forecast Summary
// =============================================================================

export interface ForecastSummary {
  metric: string;
  period: string;
  forecast: ForecastDataPoint[];
  seasonalComponents: SeasonalComponent[];
  anomalies: AnomalyPoint[];
  modelQuality: number;
}
