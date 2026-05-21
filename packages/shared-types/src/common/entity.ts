// Entity Foundation - Base Types for All Domain Entities
// Version: 1.0
// Status: LOCKED
// Effective Date: 2026-05-19

import type { EntityId } from '../types/EntityId'

export type { EntityId }

// =============================================================================
// Timestamps
// =============================================================================

/**
 * Standard timestamp interface for entity creation tracking
 */
export interface Timestamps {
  /** Created timestamp (ISO-8601) */
  createdAt: string;
  /** Updated timestamp (ISO-8601) */
  updatedAt: string;
}

/**
 * Soft delete timestamp interface
 */
export interface SoftDelete {
  /** Soft delete timestamp (ISO-8601) */
  deletedAt?: string;
}

// =============================================================================
// Base Entity
// =============================================================================

/**
 * Base entity interface - all entities should extend this
 * Provides common properties for all domain entities
 */
export interface BaseEntity {
  /** Unique entity ID (UUID string) */
  id: EntityId;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * Soft deletable entity interface
 */
export interface SoftDeletableEntity extends BaseEntity {
  /** Soft delete timestamp */
  deletedAt?: string;
}

// =============================================================================
// Audit Fields
// =============================================================================

/**
 * Audit fields for tracking who created/updated entities
 */
export interface AuditFields {
  /** User ID who created the entity */
  createdBy?: string;
  /** User ID who last updated the entity */
  updatedBy?: string;
}

// =============================================================================
// Entity Status
// =============================================================================

/**
 * Standard entity status enum
 */
export type EntityStatus = 'active' | 'inactive' | 'archived';

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Check if entity has soft delete
 */
export function isSoftDeleted(entity: BaseEntity & Partial<SoftDelete>): boolean {
  return entity.deletedAt !== undefined && entity.deletedAt !== null;
}