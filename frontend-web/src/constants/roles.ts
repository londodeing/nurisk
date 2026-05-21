/**
 * Roles Constants
 * User roles dengan level number
 */

import type { UserRole } from '@nurisk/shared-types';

// =============================================================================
// Roles Configuration
// =============================================================================

export const ROLES: Record<
  UserRole,
  { level: number; label: string; description: string }
> = {
  SUPER_ADMIN: {
    level: 100,
    label: 'Super Admin',
    description: 'Administrator sistem penuh',
  },
  ADMIN_PWNU: {
    level: 90,
    label: 'Admin PWNU',
    description: 'Admin tingkat Provinsi',
  },
  PWNU: {
    level: 85,
    label: 'PWNU',
    description: 'Organisasi Provinsi',
  },
  STAFF_PWNU: {
    level: 80,
    label: 'Staff PWNU',
    description: 'Staff tingkat Provinsi',
  },
  COMMANDER: {
    level: 75,
    label: 'Commander',
    description: 'Komandan insiden',
  },
  ADMIN_PCNU: {
    level: 70,
    label: 'Admin PCNU',
    description: 'Admin tingkat Kabupaten/Kota',
  },
  STAFF_PCNU: {
    level: 60,
    label: 'Staff PCNU',
    description: 'Staff tingkat Kabupaten/Kota',
  },
  FIELD_STAFF: {
    level: 50,
    label: 'Field Staff',
    description: 'Staff lapangan',
  },
  RELAWAN: {
    level: 40,
    label: 'Relawan',
    description: 'Relawan komunitas',
  },
  PUBLIC: {
    level: 10,
    label: 'Publik',
    description: 'Pengguna umum',
  },
} as const;

// =============================================================================
// Role Groups
// =============================================================================

export const ROLE_GROUPS = {
  ADMIN: ['SUPER_ADMIN', 'ADMIN_PWNU', 'PWNU', 'STAFF_PWNU'] as const,
  COMMAND: ['COMMANDER'] as const,
  OPERATIONAL: ['ADMIN_PCNU', 'STAFF_PCNU', 'FIELD_STAFF'] as const,
  VOLUNTEER: ['RELAWAN'] as const,
  PUBLIC: ['PUBLIC'] as const,
};

// =============================================================================
// Get Role Info
// =============================================================================

export function getRoleLabel(role: UserRole): string {
  return ROLES[role]?.label ?? role;
}

export function getRoleLevel(role: UserRole): number {
  return ROLES[role]?.level ?? 0;
}

export function getRoleDescription(role: UserRole): string {
  return ROLES[role]?.description ?? '';
}

// =============================================================================
// Role Helpers
// =============================================================================

export function isAdminRole(role: UserRole): boolean {
  return ROLE_GROUPS.ADMIN.includes(role as typeof ROLE_GROUPS.ADMIN[number]);
}

export function isCommandRole(role: UserRole): boolean {
  return role === 'COMMANDER';
}

export function isOperationalRole(role: UserRole): boolean {
  return ROLE_GROUPS.OPERATIONAL.includes(role as typeof ROLE_GROUPS.OPERATIONAL[number]);
}

export function isVolunteerRole(role: UserRole): boolean {
  return role === 'RELAWAN';
}

export function isPublicRole(role: UserRole): boolean {
  return role === 'PUBLIC';
}

export function hasRoleLevel(requiredLevel: number, userRole: UserRole): boolean {
  return getRoleLevel(userRole) >= requiredLevel;
}