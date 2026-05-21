export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN_PWNU',
  'PWNU',
  'STAFF_PWNU',
  'COMMANDER',
  'ADMIN_PCNU',
  'STAFF_PCNU',
  'FIELD_STAFF',
  'RELAWAN',
  'PUBLIC',
] as const;

export type UserRole = (typeof ROLES)[number];

/**
 * Role hierarchy for permission escalation
 * Higher index = more privileges
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  PUBLIC: 10,
  RELAWAN: 40,
  FIELD_STAFF: 50,
  STAFF_PCNU: 60,
  ADMIN_PCNU: 70,
  COMMANDER: 75,
  STAFF_PWNU: 80,
  PWNU: 85,
  ADMIN_PWNU: 90,
  SUPER_ADMIN: 100,
};

/**
 * Check if a role has minimum required level
 */
export function hasRoleLevel(role: UserRole, minLevel: number): boolean {
  return ROLE_HIERARCHY[role] >= minLevel;
}

/**
 * Check if role A includes role B (hierarchy check)
 */
export function roleIncludes(requiredRole: UserRole, userRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}