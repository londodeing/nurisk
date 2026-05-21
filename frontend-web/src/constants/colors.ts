/**
 * Color Constants
 * 
 * All color constants used throughout the frontend.
 * These are UI-specific and not part of shared-types.
 */

import type { IncidentStatus, PriorityLevel, UserRole } from '@nurisk/shared-types'
import type { VolunteerStatus } from '@nurisk/shared-types'
import type { DamageLevel } from '@nurisk/shared-types'

// =============================================================================
// Incident Status Colors
// =============================================================================

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  REPORTED: '#F59E0B',
  ASSIGNED: '#3B82F6',
  IN_PROGRESS: '#06B6D4',
  RESOLVED: '#10B981',
  CLOSED: '#6B7280',
};

// =============================================================================
// Priority Colors
// =============================================================================

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
};

// =============================================================================
// Role Colors
// =============================================================================

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: '#7C3AED',
  ADMIN_PWNU: '#3B82F6',
  PWNU: '#6366F1',
  STAFF_PWNU: '#8B5CF6',
  COMMANDER: '#10B981',
  ADMIN_PCNU: '#0EA5E9',
  STAFF_PCNU: '#06B6D4',
  FIELD_STAFF: '#F59E0B',
  RELAWAN: '#F97316',
  PUBLIC: '#6B7280',
};

// =============================================================================
// Volunteer Status Colors
// =============================================================================

export const VOLUNTEER_STATUS_COLORS: Record<VolunteerStatus, string> = {
  ACTIVE: '#10B981',
  DEPLOYED: '#F97316',
  ON_DUTY: '#3B82F6',
  OFF_DUTY: '#6B7280',
  INACTIVE: '#EF4444',
};

// =============================================================================
// Damage Level Colors
// =============================================================================

export const DAMAGE_LEVEL_COLORS: Record<DamageLevel, string> = {
  TOTAL: '#991B1B',
  HEAVY: '#DC2626',
  MEDIUM: '#F59E0B',
  LIGHT: '#FBBF24',
};

// =============================================================================
// Alert Severity Colors
// =============================================================================

export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

// =============================================================================
// Risk Level Colors
// =============================================================================

export const RISK_LEVEL_COLORS: Record<string, string> = {
  CRITICAL: '#991B1B',
  HIGH: '#DC2626',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};