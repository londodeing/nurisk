/**
 * Assessment Constants
 * 
 * Assessment-related constants used throughout the frontend.
 * These are UI-specific and not part of shared-types.
 */

import type { DamageLevel, ImpactCategory, AssessmentType, AssessmentStatus } from '@nurisk/shared-types'

// =============================================================================
// Damage Level Information
// =============================================================================

export const DAMAGE_LEVEL_LABELS: Record<DamageLevel, string> = {
  TOTAL: 'Total',
  HEAVY: 'Berat',
  MEDIUM: 'Sedang',
  LIGHT: 'Ringan',
};

export const DAMAGE_LEVEL_INFO: Record<DamageLevel, { label: string; description: string }> = {
  TOTAL: {
    label: 'Total',
    description: 'Kerusakan total, tidak dapat digunakan',
  },
  HEAVY: {
    label: 'Berat',
    description: 'Kerusakan berat, memerlukan perbaikan besar',
  },
  MEDIUM: {
    label: 'Sedang',
    description: 'Kerusakan sedang, dapat diperbaiki',
  },
  LIGHT: {
    label: 'Ringan',
    description: 'Kerusakan ringan, perbaikan minor',
  },
};

// =============================================================================
// Impact Category Labels
// =============================================================================

export const IMPACT_CATEGORY_LABELS: Record<ImpactCategory, string> = {
  CASUALTIES: 'Korban Jiwa',
  INFRASTRUCTURE: 'Infrastruktur',
  ECONOMIC: 'Ekonomi',
  ENVIRONMENT: 'Lingkungan',
};

// =============================================================================
// Assessment Type Labels
// =============================================================================

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  INITIAL: 'Penilaian Awal',
  DETAILED: 'Penilaian Detail',
  FOLLOW_UP: 'Peninjauan Ulang',
};

// =============================================================================
// Assessment Status Labels
// =============================================================================

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Terkirim',
  VERIFIED: 'Terverifikasi',
  APPROVED: 'Disetujui',
};