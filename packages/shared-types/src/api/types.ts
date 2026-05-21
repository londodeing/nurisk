// API Types - Business Interfaces

// =============================================================================
// API Response
// =============================================================================

export interface ApiResponse<T> {
  /** Success flag */
  success: boolean;
  /** Response message */
  message?: string;
  /** Response data */
  data: T;
  /** Meta information */
  meta?: ApiMeta;
}

// =============================================================================
// API Error
// =============================================================================

export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error details (optional) */
  details?: unknown;
  /** Field (optional, for validation errors) */
  field?: string;
}

// =============================================================================
// API Meta
// =============================================================================

export interface ApiMeta {
  /** Pagination */
  pagination?: PaginationMeta;
  /** Timestamp */
  timestamp?: string;
  /** Request ID */
  requestId?: string;
}

// =============================================================================
// Pagination Meta
// =============================================================================

export interface PaginationMeta {
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Total items */
  total: number;
  /** Total pages */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrev: boolean;
}

// =============================================================================
// Pagination Request
// =============================================================================

export interface PaginationRequest {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// List Response
// =============================================================================

export interface ListResponse<T> {
  /** Items */
  items: T[];
  /** Pagination meta */
  pagination: PaginationMeta;
}