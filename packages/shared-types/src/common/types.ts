// Common Types - Reusable Cross-Domain Types

// =============================================================================
// Geo Location (re-exported from canonical location)
// =============================================================================

export type { GeoLocation } from '../types/Geolocation'

// =============================================================================
// Date Range
// =============================================================================

export interface DateRange {
  /** Start date */
  startDate: string;
  /** End date */
  endDate: string;
}

// =============================================================================
// Deep Partial
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};