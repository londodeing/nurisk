/**
 * @deprecated Use ListResponse<T> from @nurisk/shared-types instead
 * 
 * This DTO is DEPRECATED as of 2026-05-21
 * Migration: Use packages/shared-types/src/api/types.ts::ListResponse<T>
 */

// Request DTO for paginated queries
export class PaginatedRequestDTO {
  page: number = 1;
  limit: number = 10;
  sortBy?: string;
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Optional filters can be added here or in specific DTOs that extend this
  [key: string]: any;
}

/**
 * @deprecated Use ListResponse<T> from @nurisk/shared-types instead
 * 
 * This DTO is DEPRECATED as of 2026-05-21
 * Migration: Use packages/shared-types/src/api/types.ts::ListResponse<T>
 */

// Response DTO for paginated results
/** @deprecated */
export class PaginatedResponseDTO<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPrevPage = page > 1;
  }
}