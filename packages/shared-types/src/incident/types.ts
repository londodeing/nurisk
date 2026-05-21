// Incident Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { DisasterType, IncidentStatus, PriorityLevel, IncidentTimelineEventType } from './enums';

// =============================================================================
// Priority Thresholds
// =============================================================================

export interface PriorityThresholds {
  /** Number of casualties threshold */
  casualties: number;
  /** Number of affected people threshold */
  affected: number;
  /** Estimated damage (IDR) */
  damageEstimate: number;
  /** Geographic coverage (km²) */
  coverage: number;
}

// =============================================================================
// Incident
// =============================================================================

export interface Incident {
  /** Unique incident ID */
  id: string;
  /** Incident title */
  title: string;
  /** Incident description */
  description: string;
  /** Disaster type */
  type: DisasterType;
  /** Current status */
  status: IncidentStatus;
  /** Priority level */
  severity: PriorityLevel;
  /** Location */
  location: GeoLocation;
  /** Reported by user ID */
  reportedBy: string;
  /** Reported by name */
  reportedByName?: string;
  /** Assigned team/user IDs */
  assignedTo?: string[];
  /** Assigned team names */
  assignedToNames?: string[];
  /** Number of casualties */
  casualties?: number;
  /** Number of affected people */
  affectedCount?: number;
  /** Estimated damage (IDR) */
  estimatedDamage?: number;
  /** Start time */
  startedAt: string;
  /** End time (optional) */
  endedAt?: string;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

// =============================================================================
// Incident Create Request
// =============================================================================

export interface CreateIncidentRequest {
  /** Incident title */
  title: string;
  /** Incident description */
  description: string;
  /** Disaster type */
  type: DisasterType;
  /** Location */
  location: GeoLocation;
  /** Number of casualties (optional) */
  casualties?: number;
  /** Number of affected people (optional) */
  affectedCount?: number;
  /** Estimated damage (optional) */
  estimatedDamage?: number;
  /** Start time (optional) */
  startedAt?: string;
  /** Images (optional) */
  images?: string[];
  /** Videos (optional) */
  videos?: string[];
}

// =============================================================================
// Incident Update Request
// =============================================================================

export interface UpdateIncidentRequest {
  /** Incident title (optional) */
  title?: string;
  /** Incident description (optional) */
  description?: string;
  /** Disaster type (optional) */
  type?: DisasterType;
  /** Status (optional) */
  status?: IncidentStatus;
  /** Priority level (optional) */
  severity?: PriorityLevel;
  /** Location (optional) */
  location?: GeoLocation;
  /** Assigned team/user IDs (optional) */
  assignedTo?: string[];
  /** Number of casualties (optional) */
  casualties?: number;
  /** Number of affected people (optional) */
  affectedCount?: number;
  /** Estimated damage (optional) */
  estimatedDamage?: number;
  /** End time (optional) */
  endedAt?: string;
}

// =============================================================================
// Incident Filter
// =============================================================================

export interface IncidentFilter {
  /** Filter by disaster type */
  type?: DisasterType;
  /** Filter by status */
  status?: IncidentStatus;
  /** Filter by severity */
  severity?: PriorityLevel;
  /** Filter by region (province) */
  province?: string;
  /** Filter by regency */
  regency?: string;
  /** Filter by district */
  district?: string;
  /** Filter by date range start */
  startDate?: string;
  /** Filter by date range end */
  endDate?: string;
  /** Filter by assigned user ID */
  assignedTo?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Incident Timeline Event
// =============================================================================

export interface IncidentTimelineEvent {
  /** Event ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Event type */
  type: IncidentTimelineEventType;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** User ID who performed action */
  performedBy: string;
  /** User name */
  performedByName?: string;
  /** Previous value */
  previousValue?: string;
  /** New value */
  newValue?: string;
  /** Timestamp */
  createdAt: string;
}

// =============================================================================
// Incident Statistics
// =============================================================================

export interface IncidentStatistics {
  /** Total incidents */
  total: number;
  /** Active incidents */
  active: number;
  /** Resolved incidents */
  resolved: number;
  /** By status */
  byStatus: Record<IncidentStatus, number>;
  /** By type */
  byType: Record<DisasterType, number>;
  /** By severity */
  bySeverity: Record<PriorityLevel, number>;
  /** Total casualties */
  totalCasualties: number;
  /** Total affected */
  totalAffected: number;
  /** Total estimated damage */
  totalEstimatedDamage: number;
}

// =============================================================================
// Incident Severity
// =============================================================================

export type IncidentSeverity = PriorityLevel;

// =============================================================================
// Disaster Type Info
// =============================================================================

export interface DisasterTypeInfo {
  /** Type key */
  type: DisasterType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon name */
  icon: string;
  /** Color */
  color: string;
  /** Category */
  category: 'natural' | 'social' | 'technological';
}