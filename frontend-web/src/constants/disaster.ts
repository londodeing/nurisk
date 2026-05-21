/**
 * Disaster Type Constants
 * 
 * Disaster type labels and icons used throughout the frontend.
 * These are UI-specific and not part of shared-types.
 */

import type { DisasterType, IncidentStatus, PriorityLevel } from '@nurisk/shared-types'

// =============================================================================
// Incident Status Labels
// =============================================================================

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Dilaporkan',
  ASSIGNED: 'Ditugaskan',
  IN_PROGRESS: 'Sedang Ditangani',
  RESOLVED: 'Terselesaikan',
  CLOSED: 'Ditutup',
};

// =============================================================================
// Priority Labels
// =============================================================================

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  CRITICAL: 'Kritis',
};

// =============================================================================
// Disaster Type Labels
// =============================================================================

export const DISASTER_TYPE_LABELS: Record<DisasterType, string> = {
  BANJIR: 'Banjir',
  LONGSOR: 'Tanah Longsor',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Gunung Meretus',
  KEBAKARAN_HUTAN: 'Kebakaran Hutan',
  KEBAKARAN_BANGUNAN: 'Kebakaran Bangunan',
  GEMPA: 'Gempa',
  EKSTREM_CUACA: 'Cuaca Ekstrem',
  WABAH_PENYAKIT: 'Wabah Penyakit',
};

// =============================================================================
// Disaster Type Icons
// =============================================================================

export const DISASTER_TYPE_ICONS: Record<DisasterType, string> = {
  BANJIR: 'Flood',
  LONGSOR: 'Mountain',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Volcano',
  KEBAKARAN_HUTAN: 'Flame',
  KEBAKARAN_BANGUNAN: 'Flame',
  GEMPA: 'Seismic',
  EKSTREM_CUACA: 'CloudLightning',
  WABAH_PENYAKIT: 'Virus',
};