// Analytics Enums

// =============================================================================
// Time Range
// =============================================================================

export type TimeRange =
  | 'TODAY'        // Today
  | 'YESTERDAY'   // Yesterday
  | 'LAST_7_DAYS' // Last 7 days
  | 'LAST_30_DAYS' // Last 30 days
  | 'THIS_MONTH'  // This month
  | 'LAST_MONTH'  // Last month
  | 'THIS_QUARTER' // This quarter
  | 'THIS_YEAR'  // This year
  | 'CUSTOM';    // Custom range

// =============================================================================
// Chart Type
// =============================================================================

export type ChartType =
  | 'LINE'        // Line chart
  | 'BAR'         // Bar chart
  | 'PIE'         // Pie chart
  | 'DONUT'       // Donut chart
  | 'AREA'        // Area chart
  | 'SCATTER';   // Scatter plot

// =============================================================================
// Risk Level
// =============================================================================

export type RiskLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

// =============================================================================
// Weather Alert Type
// =============================================================================

export type WeatherAlertType =
  | 'FLOOD'        // Flood warning
  | 'LANDSLIDE'    // Landslide warning
  | 'STORM'        // Storm warning
  | 'HEAT_WAVE'   // Heat wave
  | 'DROUGHT';    // Drought warning

// =============================================================================
// Alert Severity
// =============================================================================

export type AlertSeverity =
  | 'EXTREME'     // Extreme
  | 'SEVERE'      // Severe
  | 'MODERATE'    // Moderate
  | 'MINOR';      // Minor

// =============================================================================
// Report Type
// =============================================================================

export type ReportType =
  | 'INCIDENT_SUMMARY'      // Incident summary
  | 'RESPONSE_TIME'         // Response time
  | 'RESOURCE_UTILIZATION' // Resource utilization
  | 'IMPACT_ASSESSMENT'    // Impact assessment
  | 'VOLUNTEER_ACTIVITY'; // Volunteer activity