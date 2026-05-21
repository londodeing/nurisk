// Incident Enums

// =============================================================================
// Disaster Types
// CANONICAL SOURCE: backend/prisma/schema.prisma
// All other packages must follow this enum exactly
// =============================================================================

export type DisasterType =
  | 'BANJIR'
  | 'LONGSOR'
  | 'GEMPA'
  | 'TSUNAMI'
  | 'VOLKANO'
  | 'KEBAKARAN_HUTAN'
  | 'KEBAKARAN_BANGUNAN'
  | 'EKSTREM_CUACA'
  | 'WABAH_PENYAKIT'

// =============================================================================
// Incident Status
// CANONICAL SOURCE: backend/prisma/schema.prisma
// =============================================================================

export type IncidentStatus =
  | 'REPORTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'

// =============================================================================
// Priority Level
// =============================================================================

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// =============================================================================
// Incident Timeline Event Type
// =============================================================================

export type IncidentTimelineEventType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'SEVERITY_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'COMMENT_ADDED'
  | 'MEDIA_ADDED'
  | 'ASSESSMENT_COMPLETED'
  | 'ACTION_STARTED'
  | 'ACTION_COMPLETED'
  | 'RESOLVED'
  | 'REOPENED';