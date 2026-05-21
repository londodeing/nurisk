// Mission Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type {
  MissionStatus,
  MissionType,
} from './enums';

// =============================================================================
// Mission
// =============================================================================

export interface Mission {
  /** Mission ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Mission name */
  name: string;
  /** Mission type */
  type: MissionType;
  /** Status */
  status: MissionStatus;
  /** Priority */
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  /** Location */
  location: GeoLocation;
  /** Description */
  description?: string;
  /** Start time */
  startedAt?: string;
  /** End time */
  endedAt?: string;
  /** Deadline - latest acceptable start/execution time */
  deadline?: string;
  /** Volunteers needed */
  volunteersNeeded?: number;
  /** Volunteers joined */
  volunteersJoined?: number;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Mission Assignment
// =============================================================================

export interface MissionAssignment {
  /** Assignment ID */
  id: string;
  /** Mission ID */
  missionId: string;
  /** Assigned user/team ID */
  assigneeId: string;
  /** Assigned user/team name */
  assigneeName?: string;
  /** Role */
  role: string;
  /** Assigned at */
  assignedAt: string;
}

// =============================================================================
// Mission Report
// =============================================================================

export interface MissionReport {
  /** Report ID */
  id: string;
  /** Mission ID */
  missionId: string;
  /** Summary */
  summary: string;
  /** Findings */
  findings: string[];
  /** Recommendations */
  recommendations?: string[];
  /** Reported by user ID */
  reportedBy: string;
  /** Reported by name */
  reportedByName?: string;
  /** Created at */
  createdAt: string;
}

// =============================================================================
// Mission Priority
// =============================================================================

export type MissionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// =============================================================================
// Mission Filter
// =============================================================================

export interface MissionFilter {
  /** Filter by incident ID */
  incidentId?: string;
  /** Filter by type */
  type?: MissionType;
  /** Filter by status */
  status?: MissionStatus;
  /** Search query */
  search?: string;
}
