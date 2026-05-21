// ChatUser Entity - Canonical Contract

import type { BaseEntity } from '../common/entity';

export interface ChatUser extends BaseEntity {
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** Avatar URL */
  avatar?: string;
  /** Is currently online */
  isOnline?: boolean;
  /** Last seen timestamp */
  lastSeen?: string;
  /** Phone number */
  phone?: string;
  /** Organization/affiliation */
  organization?: string;
  /** Role/title */
  role?: string;
}
