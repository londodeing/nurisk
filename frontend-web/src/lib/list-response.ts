/**
 * Canonical ListResponse Handler
 * 
 * This module provides unified handling for ListResponse<T> from SDK/Backend.
 * ListResponse is the SINGLE SOURCE OF TRUTH for paginated responses.
 * 
 * Backend returns: { items: T[], pagination: {...} }
 * This handler ensures proper typing and error detection.
 */

import type { ListResponse, PaginationMeta } from '@nurisk/shared-types/api';

/**
 * Extract items from ListResponse
 * Throws if response is invalid (no silent fallback)
 */
export function extractListItems<T>(response: ListResponse<T> | undefined | null, endpoint: string): T[] {
  if (!response) {
    throw new Error(`[${endpoint}] Invalid response: response is null or undefined`);
  }
  
  if (!response.items) {
    throw new Error(`[${endpoint}] Invalid response structure: missing 'items' field. Got: ${JSON.stringify(response)}`);
  }
  
  return response.items;
}

/**
 * Extract pagination metadata from ListResponse
 */
export function extractPagination(response: ListResponse<unknown> | undefined | null): PaginationMeta {
  if (!response?.pagination) {
    return {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
  }
  
  return response.pagination;
}

/**
 * Check if ListResponse has data
 */
export function hasListData<T>(response: ListResponse<T> | undefined | null): boolean {
  return !!(response?.items && response.items.length > 0);
}

/**
 * Get total count from ListResponse
 */
export function getListTotal(response: ListResponse<unknown> | undefined | null): number {
  return response?.pagination?.total ?? 0;
}

/**
 * Create empty ListResponse
 */
export function createEmptyListResponse<T>(): ListResponse<T> {
  return {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

/**
 * Type guard for ListResponse
 */
export function isListResponse<T>(value: unknown): value is ListResponse<T> {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.items) &&
    typeof obj.pagination === 'object'
  );
}