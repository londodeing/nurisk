// Assessment Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type {
  DamageLevel, ImpactCategory, AssessmentType, AssessmentStatus, DamageReportType
} from './enums';

// =============================================================================
// Assessment
// =============================================================================

export interface Assessment {
  /** Assessment ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Assessed by user ID */
  assessedBy: string;
  /** Assessed by name */
  assessedByName?: string;
  /** Assessment type */
  type: AssessmentType;
  /** Status */
  status: AssessmentStatus;
  /** Location */
  location: GeoLocation;
  /** Damage level */
  damageLevel: DamageLevel;
  /** Description */
  description: string;
  /** Affected count */
  affectedCount?: number;
  /** Casualties count */
  casualtiesCount?: number;
  /** Estimated loss (IDR) */
  estimatedLoss?: number;
  /** Images */
  images?: string[];
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Damage Report
// =============================================================================

export interface DamageReport {
  /** Report ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Assessment ID */
  assessmentId?: string;
  /** Report type */
  type: DamageReportType;
  /** Category */
  category: ImpactCategory;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Location */
  location: GeoLocation;
  /** Owner name */
  ownerName?: string;
  /** Damage level */
  damageLevel: DamageLevel;
  /** Quantity */
  quantity?: number;
  /** Unit */
  unit?: string;
  /** Estimated value (IDR) */
  estimatedValue?: number;
  /** Images */
  images?: string[];
  /** Created at */
  createdAt: string;
}

// =============================================================================
// Impact Summary
// =============================================================================

export interface ImpactSummary {
  /** Total casualties */
  totalCasualties: number;
  /** Missing */
  missing: number;
  /** Injured */
  injured: number;
  /** Displaced */
  displaced: number;
  /** Evacuated */
  evacuated: number;
  /** Buildings damaged */
  buildingsDamaged: number;
  /** Roads affected */
  roadsAffected: number;
  /** Bridges damaged */
  bridgesDamaged: number;
  /** Schools affected */
  schoolsAffected: number;
  /** Health facilities affected */
  healthFacilitiesAffected: number;
  /** Estimated economic loss */
  estimatedEconomicLoss: number;
}

// =============================================================================
// Assessment Filter
// =============================================================================

export interface AssessmentFilter {
  /** Filter by incident ID */
  incidentId?: string;
  /** Filter by type */
  type?: AssessmentType;
  /** Filter by status */
  status?: AssessmentStatus;
  /** Filter by damage level */
  damageLevel?: DamageLevel;
  /** Search query */
  search?: string;
}

// =============================================================================
// Assessment Section
// =============================================================================

export interface AssessmentSection {
  /** Section name */
  sectionName: string;
  /** Weight (0-100) */
  weight: number;
  /** Score (0-100) */
  score: number;
  /** Findings */
  findings: string[];
}

// =============================================================================
// Building Assessment
// =============================================================================

export interface BuildingAssessment extends Assessment {
  /** Building ID */
  buildingId: string;
  /** Building name */
  buildingName?: string;
  /** Assessment sections */
  sections: AssessmentSection[];
  /** Total score (0-100) */
  totalScore: number;
}

// =============================================================================
// Resilience Score
// =============================================================================

export interface ResilienceScore {
  /** Overall resilience score (0-100) */
  overall: number;
  /** Structural resilience score (0-100) */
  structural: number;
  /** Operational resilience score (0-100) */
  operational: number;
}