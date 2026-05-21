/**
 * Skill Constants
 * 
 * Skill information used throughout the frontend.
 * These are UI-specific and not part of shared-types.
 */

import type { SkillType, VolunteerStatus, VolunteerType } from '@nurisk/shared-types'

// =============================================================================
// Skill Information
// =============================================================================

export interface SkillInfo {
  type: SkillType;
  label: string;
  icon: string;
  description: string;
}

export const SKILL_INFO: Record<SkillType, SkillInfo> = {
  FIRST_AID: {
    type: 'FIRST_AID',
    label: 'Pertolongan Pertama',
    icon: 'Heart',
    description: 'Kemampuan memberikan pertolongan pertama pada korban',
  },
  SEARCH_RESCUE: {
    type: 'SEARCH_RESCUE',
    label: 'Pencarian & Pertolongan',
    icon: 'Search',
    description: 'Kemampuan pencarian dan pertolongan',
  },
  MEDICAL: {
    type: 'MEDICAL',
    label: 'Medis',
    icon: 'Stethoscope',
    description: 'Kemampuan medis dasar',
  },
  LOGISTICS: {
    type: 'LOGISTICS',
    label: 'Logistik',
    icon: 'Package',
    description: 'Manajemen logistik',
  },
  COMMUNICATION: {
    type: 'COMMUNICATION',
    label: 'Komunikasi',
    icon: 'Radio',
    description: 'Komunikasi radio',
  },
  DRIVING: {
    type: 'DRIVING',
    label: 'Mengemudi',
    icon: 'Car',
    description: 'Kemampuan mengemudi',
  },
  COORDINATION: {
    type: 'COORDINATION',
    label: 'Koordinasi',
    icon: 'Users',
    description: 'Koordinasi tim',
  },
  EVACUATION: {
    type: 'EVACUATION',
    label: 'Evakuasi',
    icon: 'ArrowRight',
    description: 'Evakuasi korban',
  },
  SHELTER_MANAGEMENT: {
    type: 'SHELTER_MANAGEMENT',
    label: 'Pengelolaan Shelter',
    icon: 'Home',
    description: 'Pengelolaan shelter',
  },
  WATER_RESCUE: {
    type: 'WATER_RESCUE',
    label: 'Pertolongan Air',
    icon: 'Waves',
    description: 'Pertolongan di air',
  },
};

// =============================================================================
// Volunteer Status Labels
// =============================================================================

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatus, string> = {
  ACTIVE: 'Aktif',
  DEPLOYED: 'Dikirim',
  ON_DUTY: 'Bertugas',
  OFF_DUTY: 'Selesai Tugas',
  INACTIVE: 'Nonaktif',
};

// =============================================================================
// Volunteer Type Labels
// =============================================================================

export const TYPE_LABELS: Record<VolunteerType, string> = {
  RELAWAN_PBNU: 'Relawan PBNU',
  RELAWAN_PCNU: 'Relawan PCNU',
  RELAWAN_CABANG: 'Relawan Cabang',
  RELAWAN_DESA: 'Relawan Desa',
};