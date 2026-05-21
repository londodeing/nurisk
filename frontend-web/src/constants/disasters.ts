/**
 * Disaster Types Constants
 * 11 jenis bencana sesuai PRD
 */

import type { DisasterType, IncidentStatus, PriorityLevel } from '@nurisk/shared-types';

// =============================================================================
// Disaster Types (11 jenis)
// =============================================================================

export const DISASTER_TYPES = [
  { id: 'BANJIR', label: 'Banjir', icon: '🌊', color: '#3b82f6' },
  { id: 'LONGSOR', label: 'Tanah Longsor', icon: '⛰️', color: '#a855f7' },
  { id: 'GEMPA', label: 'Gempa', icon: '🏚️', color: '#f97316' },
  { id: 'TSUNAMI', label: 'Tsunami', icon: '🌊', color: '#06b6d4' },
  { id: 'VOLKANO', label: 'Gunung Meletus', icon: '🌋', color: '#ef4444' },
  { id: 'KEBAKARAN_HUTAN', label: 'Kebakaran Hutan', icon: '🔥', color: '#f97316' },
  { id: 'KEBAKARAN_BANGUNAN', label: 'Kebakaran Bangunan', icon: '🔥', color: '#dc2626' },
  { id: 'EKSTREM_CUACA', label: 'Cuaca Ekstrem', icon: '⛈️', color: '#6366f1' },
  { id: 'WABAH_PENYAKIT', label: 'Wabah Penyakit', icon: '🦠', color: '#ec4899' },
] as const;

export type DisasterTypeConfig = typeof DISASTER_TYPES[number];

// =============================================================================
// Disaster Type Lookup
// =============================================================================

export const DISASTER_TYPE_MAP = DISASTER_TYPES.reduce(
  (acc, type) => {
    acc[type.id] = type;
    return acc;
  },
  {} as Record<DisasterType, { id: DisasterType; label: string; icon: string; color: string }>
);

// =============================================================================
// Get Disaster Type Label
// =============================================================================

export function getDisasterTypeLabel(type: DisasterType): string {
  return DISASTER_TYPE_MAP[type]?.label ?? type;
}

export function getDisasterTypeIcon(type: DisasterType): string {
  return DISASTER_TYPE_MAP[type]?.icon ?? '⚠️';
}

export function getDisasterTypeColor(type: DisasterType): string {
  return DISASTER_TYPE_MAP[type]?.color ?? '#6b7280';
}

// =============================================================================
// Incident Status Flow (sesuai PRD)
// =============================================================================

export const INCIDENT_STATUS_FLOW = [
  'REPORTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Dilaporkan',
  ASSIGNED: 'Ditugaskan',
  IN_PROGRESS: 'Penanganan',
  RESOLVED: 'Selesai',
  CLOSED: 'Ditutup',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  REPORTED: '#6b7280',
  ASSIGNED: '#3b82f6',
  IN_PROGRESS: '#ef4444',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
};

// =============================================================================
// Get Incident Status Label
// =============================================================================

export function getIncidentStatusLabel(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status] ?? status;
}

export function getIncidentStatusColor(status: IncidentStatus): string {
  return INCIDENT_STATUS_COLORS[status] ?? '#6b7280';
}

// =============================================================================
// Priority Score Thresholds
// =============================================================================

export const PRIORITY_THRESHOLDS: Record<
  PriorityLevel,
  { min: number; max: number; color: string; label: string }
> = {
  CRITICAL: { min: 1000, max: 9999, color: '#dc2626', label: 'Kritis' },
  HIGH: { min: 500, max: 999, color: '#f97316', label: 'Tinggi' },
  MEDIUM: { min: 200, max: 499, color: '#eab308', label: 'Sedang' },
  LOW: { min: 0, max: 199, color: '#22c55e', label: 'Rendah' },
};

// =============================================================================
// Get Priority from Score
// =============================================================================

export function getPriorityFromScore(score: number): PriorityLevel {
  if (score >= 1000) return 'CRITICAL';
  if (score >= 500) return 'HIGH';
  if (score >= 200) return 'MEDIUM';
  return 'LOW';
}

export function getPriorityLabel(priority: PriorityLevel): string {
  return PRIORITY_THRESHOLDS[priority].label;
}

export function getPriorityColor(priority: PriorityLevel): string {
  return PRIORITY_THRESHOLDS[priority].color;
}