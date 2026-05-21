// Volunteer Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { 
  VolunteerStatus, VolunteerType, SkillType, 
  TeamType, TeamStatus, TeamMemberRole,
  AssignmentType, AssignmentStatus, CheckInType 
} from './enums';

// =============================================================================
// Volunteer
// =============================================================================

export interface Volunteer {
  /** Unique volunteer ID */
  id: string;
  /** User ID */
  userId: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Phone */
  phone: string;
  /** Volunteer type */
  type: VolunteerType;
  /** Status */
  status: VolunteerStatus;
  /** Skills */
  skills: SkillType[];
  /** Organization (PCNU/PCNU) */
  organization: string;
  /** Region - Province */
  province?: string;
  /** Region - Regency */
  regency?: string;
  /** Region - District */
  district?: string;
  /** Photo URL */
  photo?: string;
  /** ID Card number */
  idCardNumber?: string;
  /** Join date */
  joinedAt: string;
  /** Last active */
  lastActiveAt?: string;
  /** Total missions */
  totalMissions: number;
  /** Total hours */
  totalHours: number;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Team
// =============================================================================

export interface Team {
  /** Unique team ID */
  id: string;
  /** Team name */
  name: string;
  /** Team code */
  code: string;
  /** Team type */
  type: TeamType;
  /** Status */
  status: TeamStatus;
  /** Leader user ID */
  leaderId: string;
  /** Leader name */
  leaderName?: string;
  /** Deputy leader user ID (optional) */
  deputyLeaderId?: string;
  /** Description */
  description?: string;
  /** Organization */
  organization: string;
  /** Region */
  region?: string;
  /** Base location */
  baseLocation?: string;
  /** Number of members */
  memberCount: number;
  /** Max members */
  maxMembers: number;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Team Member
// =============================================================================

export interface TeamMember {
  /** Member ID */
  id: string;
  /** Team ID */
  teamId: string;
  /** User ID */
  userId: string;
  /** User name */
  userName: string;
  /** Role in team */
  role: TeamMemberRole;
  /** Status */
  status: VolunteerStatus;
  /** Joined at */
  joinedAt: string;
}

// =============================================================================
// Assignment
// =============================================================================

export interface Assignment {
  /** Assignment ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Incident title */
  incidentTitle?: string;
  /** Team ID */
  teamId: string;
  /** Team name */
  teamName?: string;
  /** User ID (for individual) */
  userId?: string;
  /** User name */
  userName?: string;
  /** Assignment type */
  type: AssignmentType;
  /** Status */
  status: AssignmentStatus;
  /** Start time */
  startedAt: string;
  /** End time (optional) */
  endedAt?: string;
  /** Notes */
  notes?: string;
  /** Created by user ID */
  createdBy: string;
  /** Created at */
  createdAt: string;
}

// =============================================================================
// Check-in
// =============================================================================

export interface CheckIn {
  /** Check-in ID */
  id: string;
  /** Assignment ID */
  assignmentId: string;
  /** User ID */
  userId: string;
  /** User name */
  userName?: string;
  /** Check-in type */
  type: CheckInType;
  /** Location */
  location?: GeoLocation;
  /** Notes */
  notes?: string;
  /** Timestamp */
  createdAt: string;
}

// =============================================================================
// Volunteer Skill
// =============================================================================

export type VolunteerSkill = SkillType;

// =============================================================================
// Volunteer Filter
// =============================================================================

export interface VolunteerFilter {
  /** Filter by type */
  type?: VolunteerType;
  /** Filter by status */
  status?: VolunteerStatus;
  /** Filter by skills */
  skills?: SkillType[];
  /** Filter by organization */
  organization?: string;
  /** Filter by province */
  province?: string;
  /** Filter by regency */
  regency?: string;
  /** Filter by district */
  district?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Team Filter
// =============================================================================

export interface TeamFilter {
  /** Filter by type */
  type?: TeamType;
  /** Filter by status */
  status?: TeamStatus;
  /** Filter by organization */
  organization?: string;
  /** Filter by region */
  region?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Volunteer Statistics
// =============================================================================

export interface VolunteerStatistics {
  /** Total volunteers */
  total: number;
  /** Active volunteers */
  active: number;
  /** Deployed volunteers */
  deployed: number;
  /** By status */
  byStatus: Record<VolunteerStatus, number>;
  /** By type */
  byType: Record<VolunteerType, number>;
  /** Total teams */
  totalTeams: number;
  /** Active teams */
  activeTeams: number;
}