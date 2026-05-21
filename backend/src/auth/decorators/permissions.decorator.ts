import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Granular permission decorator for fine-grained access control
 * @Permissions('incident:create', 'user:read')
 * 
 * Permissions follow pattern: resource:action
 * Resources: incident, user, volunteer, building, logistics, report
 * Actions: create, read, update, delete, approve, assign
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Predefined permission groups for common use cases
 */
export const PERMISSION_GROUPS = {
  // Incident permissions
  'incident:create': ['incident:create'],
  'incident:read': ['incident:read'],
  'incident:update': ['incident:update'],
  'incident:delete': ['incident:delete'],
  'incident:approve': ['incident:approve'],
  'incident:assign': ['incident:assign'],

  // Volunteer permissions
  'volunteer:read': ['volunteer:read'],
  'volunteer:assign': ['volunteer:assign'],
  'volunteer:deploy': ['volunteer:deploy'],

  // Building permissions
  'building:create': ['building:create'],
  'building:read': ['building:read'],
  'building:update': ['building:update'],
  'building:assess': ['building:assess'],

  // Logistics permissions
  'logistics:create': ['logistics:create'],
  'logistics:read': ['logistics:read'],
  'logistics:approve': ['logistics:approve'],
  'logistics:dispatch': ['logistics:dispatch'],

  // User management
  'user:create': ['user:create'],
  'user:read': ['user:read'],
  'user:update': ['user:update'],
  'user:delete': ['user:delete'],

  // Report permissions
  'report:create': ['report:create'],
  'report:read': ['report:read'],
  'report:verify': ['report:verify'],
} as const;