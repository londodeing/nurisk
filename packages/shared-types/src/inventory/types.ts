// Inventory Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { SupplyCategory, SupplyStatus, SupplyRequestStatus, EvacuationStatus } from './enums';

// =============================================================================
// Inventory Item
// =============================================================================

export interface InventoryItem {
  /** Item ID */
  id: string;
  /** Item name */
  name: string;
  /** Description */
  description?: string;
  /** Category */
  category: SupplyCategory;
  /** Unit */
  unit: string;
  /** Total quantity */
  totalQuantity: number;
  /** Available quantity */
  availableQuantity: number;
  /** Reserved quantity */
  reservedQuantity: number;
  /** Distributed quantity */
  distributedQuantity: number;
  /** Minimum stock */
  minimumStock: number;
  /** Maximum stock */
  maximumStock: number;
  /** Expiry date (optional) */
  expiryDate?: string;
  /** Storage location */
  storageLocation?: string;
  /** Image URL */
  imageUrl?: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Supply Request
// =============================================================================

export interface SupplyRequest {
  /** Request ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Requested by user ID */
  requestedBy: string;
  /** Requested by name */
  requestedByName?: string;
  /** Status */
  status: SupplyRequestStatus;
  /** Items */
  items: SupplyRequestItem[];
  /** Notes */
  notes?: string;
  /** Approved by (optional) */
  approvedBy?: string;
  /** Approved at (optional) */
  approvedAt?: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

export interface SupplyRequestItem {
  /** Item ID */
  itemId: string;
  /** Item name */
  itemName?: string;
  /** Quantity requested */
  quantity: number;
  /** Quantity approved */
  approvedQuantity?: number;
  /** Quantity fulfilled */
  fulfilledQuantity?: number;
}

// =============================================================================
// Evacuation
// =============================================================================

export interface Evacuation {
  /** Evacuation ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Shelter ID */
  shelterId: string;
  /** Shelter name */
  shelterName?: string;
  /** Number of evacuees */
  evacueeCount: number;
  /** Number of families */
  familyCount: number;
  /** Vulnerable count (elderly, children, disabled) */
  vulnerableCount?: number;
  /** Status */
  status: EvacuationStatus;
  /** Started at */
  startedAt: string;
  /** Ended at (optional) */
  endedAt?: string;
}

// =============================================================================
// Inventory Filter
// =============================================================================

export interface InventoryFilter {
  /** Filter by category */
  category?: SupplyCategory;
  /** Filter by status */
  status?: SupplyStatus;
  /** Filter by warehouse ID */
  warehouseId?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Distribution
// =============================================================================

export interface Distribution {
  /** Distribution ID */
  id: string;
  /** Supply request ID */
  supplyRequestId: string;
  /** Incident ID */
  incidentId: string;
  /** Shelter ID */
  shelterId?: string;
  /** Distributed by user ID */
  distributedBy: string;
  /** Distributed to */
  distributedTo: string;
  /** Items */
  items: DistributionItem[];
  /** Notes */
  notes?: string;
  /** Timestamp */
  createdAt: string;
}

export interface DistributionItem {
  /** Item ID */
  itemId: string;
  /** Item name */
  itemName?: string;
  /** Quantity */
  quantity: number;
}