// Entity Foundation - Canonical Base Types
// Re-exports from common/entity for canonical access

export type {
  EntityId,
  Timestamps,
  SoftDelete,
  BaseEntity,
  SoftDeletableEntity,
  AuditFields,
  EntityStatus,
} from '../common/entity'

export { isValidUuid, isSoftDeleted } from '../common/entity'
