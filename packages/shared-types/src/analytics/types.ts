// Analytics Types - Business Interfaces

import type { TimeRange, ChartType, RiskLevel, WeatherAlertType, AlertSeverity, ReportType } from './enums';

// =============================================================================
// Metric Value
// =============================================================================

export interface MetricValue {
  /** Label */
  label: string;
  /** Value */
  value: number;
  /** Change (optional) */
  change?: number;
  /** Change type */
  changeType?: 'increase' | 'decrease' | 'neutral';
}

// =============================================================================
// Time Series Data Point
// =============================================================================

export interface TimeSeriesPoint {
  /** Timestamp */
  timestamp: string;
  /** Value */
  value: number;
  /** Additional data */
  data?: Record<string, unknown>;
}

// =============================================================================
// Dashboard Summary
// =============================================================================

export interface DashboardSummary {
  /** Total incidents */
  totalIncidents: number;
  /** Incident change */
  incidentsChange: number;
  /** Active incidents */
  activeIncidents: number;
  /** Active change */
  activeChange: number;
  /** Total volunteers */
  totalVolunteers: number;
  /** Volunteers change */
  volunteersChange: number;
  /** Deployed teams */
  deployedTeams: number;
  /** Teams change */
  teamsChange: number;
  /** Total casualties */
  totalCasualties: number;
  /** Casualties change */
  casualtiesChange: number;
  /** Displaced people */
  displacedPeople: number;
  /** Displaced change */
  displacedChange: number;
}

// =============================================================================
// Incident Trend
// =============================================================================

export interface IncidentTrend {
  /** Time range */
  timeRange: TimeRange;
  /** Data points */
  data: TimeSeriesPoint[];
  /** Total count */
  total: number;
  /** Average */
  average: number;
  /** Peak */
  peak: number;
  /** Peak date */
  peakDate: string;
}

// =============================================================================
// Geographic Distribution
// =============================================================================

export interface GeographicDistribution {
  /** Province */
  province: string;
  /** Regency */
  regency?: string;
  /** District */
  district?: string;
  /** Count */
  count: number;
  /** Percentage */
  percentage: number;
}

// =============================================================================
// Disaster Type Distribution
// =============================================================================

export interface DisasterTypeDistribution {
  /** Disaster type */
  disasterType: string;
  /** Count */
  count: number;
  /** Percentage */
  percentage: number;
  /** Trend */
  trend: 'increasing' | 'decreasing' | 'stable';
}

// =============================================================================
// Response Time Metrics
// =============================================================================

export interface ResponseTimeMetrics {
  /** Average response time (minutes) */
  averageResponseTime: number;
  /** Median response time */
  medianResponseTime: number;
  /** Fastest response */
  fastestResponse: number;
  /** Slowest response */
  slowestResponse: number;
  /** Target response time */
  targetResponseTime: number;
}

// =============================================================================
// Resource Utilization
// =============================================================================

export interface ResourceUtilization {
  /** Resource type */
  resourceType: string;
  /** Total capacity */
  totalCapacity: number;
  /** Used */
  used: number;
  /** Available */
  available: number;
  /** Utilization rate */
  utilizationRate: number;
}

// =============================================================================
// Risk Score
// =============================================================================

export interface RiskScore {
  /** Area */
  area: string;
  /** Risk level */
  level: RiskLevel;
  /** Score (0-100) */
  score: number;
  /** Factors */
  factors: RiskFactor[];
  /** Last updated */
  lastUpdated: string;
}

export interface RiskFactor {
  /** Factor name */
  name: string;
  /** Contribution to score */
  contribution: number;
}

// =============================================================================
// Weather Alert (Analytics specific - renamed to avoid conflict with weather module)
// =============================================================================

export interface AnalyticsWeatherAlert {
  /** Alert ID */
  id: string;
  /** Alert type */
  type: WeatherAlertType;
  /** Severity */
  severity: AlertSeverity;
  /** Area */
  area: string;
  /** Description */
  description: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
  /** Created at */
  createdAt: string;
}

// =============================================================================
// Forecast
// =============================================================================

export interface Forecast {
  /** Date */
  date: string;
  /** Disaster type */
  disasterType: string;
  /** Probability (0-100) */
  probability: number;
  /** Risk level */
  riskLevel: RiskLevel;
  /** Affected areas */
  affectedAreas: string[];
  /** Recommended actions */
  recommendedActions?: string[];
}

// =============================================================================
// Analytics Filter
// =============================================================================

export interface AnalyticsFilter {
  /** Time range */
  timeRange: TimeRange;
  /** Custom start date (if CUSTOM) */
  startDate?: string;
  /** Custom end date (if CUSTOM) */
  endDate?: string;
  /** Province */
  province?: string;
  /** Regency */
  regency?: string;
  /** Disaster type */
  disasterType?: string;
}

// =============================================================================
// Chart Data
// =============================================================================

export interface ChartData {
  /** Chart type */
  type: ChartType;
  /** Title */
  title: string;
  /** Labels */
  labels: string[];
  /** Datasets */
  datasets: ChartDataset[];
}

export interface ChartDataset {
  /** Dataset label */
  label: string;
  /** Data values */
  data: number[];
  /** Color */
  color?: string;
}

// =============================================================================
// Report Request
// =============================================================================

export interface ReportRequest {
  /** Report type */
  type: ReportType;
  /** Time range */
  timeRange: TimeRange;
  /** Start date (if CUSTOM) */
  startDate?: string;
  /** End date (if CUSTOM) */
  endDate?: string;
  /** Province */
  province?: string;
  /** Regency */
  regency?: string;
  /** Format */
  format: 'PDF' | 'EXCEL' | 'CSV';
}

// =============================================================================
// Time Series Data Point (generic)
// =============================================================================

export interface TimeSeriesDataPoint<T = number> {
  /** Timestamp */
  timestamp: string;
  /** Value */
  value: T;
  /** Dimension fields for grouping/filtering */
  dimensions?: Record<string, string>;
}

// =============================================================================
// Dashboard Widget
// =============================================================================

export interface DashboardWidget {
  /** Widget ID */
  id: string;
  /** Widget title */
  title: string;
  /** Widget type */
  type: 'CHART' | 'METRIC' | 'TABLE' | 'MAP' | 'LIST';
  /** Widget data configuration */
  config: Record<string, unknown>;
  /** Position and size */
  layout: WidgetLayout;
}

// =============================================================================
// Widget Layout
// =============================================================================

export interface WidgetLayout {
  /** Column position (0-based) */
  x: number;
  /** Row position (0-based) */
  y: number;
  /** Width in grid units */
  width: number;
  /** Height in grid units */
  height: number;
}

// =============================================================================
// Analytics Dashboard
// =============================================================================

export interface AnalyticsDashboard {
  /** Dashboard ID */
  id: string;
  /** Dashboard name */
  name: string;
  /** Dashboard description */
  description?: string;
  /** Widgets */
  widgets: DashboardWidget[];
  /** Created by user ID */
  createdBy: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}