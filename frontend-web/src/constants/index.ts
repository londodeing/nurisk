/**
 * Constants Barrel Export
 * 
 * Central export for all UI constants.
 */

// =============================================================================
// Colors
// =============================================================================

export {
  STATUS_COLORS,
  PRIORITY_COLORS,
  ROLE_COLORS,
  VOLUNTEER_STATUS_COLORS,
  DAMAGE_LEVEL_COLORS,
  ALERT_SEVERITY_COLORS,
  RISK_LEVEL_COLORS,
} from './colors';

// =============================================================================
// Disaster Types
// =============================================================================

export {
  STATUS_LABELS,
  PRIORITY_LABELS,
  DISASTER_TYPE_LABELS,
  DISASTER_TYPE_ICONS,
} from './disaster';

// =============================================================================
// Skills
// =============================================================================

export type { SkillInfo } from './skills';
export { SKILL_INFO, VOLUNTEER_STATUS_LABELS, TYPE_LABELS } from './skills';

// =============================================================================
// Assessment
// =============================================================================

export {
  DAMAGE_LEVEL_LABELS,
  DAMAGE_LEVEL_INFO,
  IMPACT_CATEGORY_LABELS,
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
} from './assessment';

// =============================================================================
// API
// =============================================================================

export {
  API_ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  DEFAULT_PAGINATION,
  PAGINATION_LIMITS,
  API_TIMEOUT,
  RETRY_CONFIG,
} from './api';