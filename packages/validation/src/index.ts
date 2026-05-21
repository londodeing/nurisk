// NURisk Validation Package - Zod-based validation schemas
// Explicit exports to avoid DTS export collisions

export {
  paginationSchema,
  type PaginationInput,
  paginationMetaSchema,
  type PaginationMetaInput,
  listResponseSchema,
  apiResponseSchema,
} from './api'

export * from './auth'
export * from './incident'
export * from './volunteer'
export * from './assessment'
export * from './shelter'
export * from './warehouse'
export * from './chat'
export * from './notification'
export * from './inventory'
export * from './logistics'
export * from './mission'

// Explicit: common has internal-only pagination (re-exported from api)
export {
  dateRangeSchema,
  type DateRangeInput,
  geoLocationSchema,
  type GeoLocationInput,
  idParamSchema,
  type IdParamInput,
  bulkIdsSchema,
  type BulkIdsInput,
  searchSchema,
  type SearchInput,
} from './common'

export * from './resource'