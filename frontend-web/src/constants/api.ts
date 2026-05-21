/**
 * API Constants
 * 
 * API-related constants used throughout the frontend.
 * These are UI-specific and not part of shared-types.
 */

// =============================================================================
// API Error Codes
// =============================================================================

export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// =============================================================================
// Error Messages
// =============================================================================

export const ERROR_MESSAGES = {
  [API_ERROR_CODES.UNAUTHORIZED]: 'Session expired. Please login again.',
  [API_ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [API_ERROR_CODES.NOT_FOUND]: 'Resource not found.',
  [API_ERROR_CODES.VALIDATION_ERROR]: 'Invalid data provided.',
  [API_ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [API_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
} as const;

// =============================================================================
// Success Messages
// =============================================================================

export const SUCCESS_MESSAGES = {
  CREATE: 'Created successfully.',
  UPDATE: 'Updated successfully.',
  DELETE: 'Deleted successfully.',
  SAVE: 'Saved successfully.',
} as const;

// =============================================================================
// HTTP Status Codes
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// =============================================================================
// Pagination Defaults
// =============================================================================

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

export const PAGINATION_LIMITS = [10, 20, 50, 100] as const;

// =============================================================================
// API Configuration
// =============================================================================

export const API_TIMEOUT = 30000; // 30 seconds

export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
} as const;