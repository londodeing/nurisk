// Pagination Helpers

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationRequest {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function buildPaginationParams(params: PaginationRequest): Record<string, string> {
  return {
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
    sortOrder: params.sortOrder ?? 'desc',
  }
}

export function hasNextPage(meta: PaginationMeta): boolean {
  return meta.page < meta.totalPages
}

export function hasPrevPage(meta: PaginationMeta): boolean {
  return meta.page > 1
}

export function getPageNumbers(meta: PaginationMeta, maxVisible: number = 5): number[] {
  const { page, totalPages } = meta
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, page - half)
  let end = Math.min(totalPages, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}