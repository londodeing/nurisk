// Logistics Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type {
  LogisticsSupplyStatus,
  RequestPriority,
  TransportType,
  LogisticsRequestStatus,
} from './enums';

// =============================================================================
// Supply Item
// =============================================================================

export interface SupplyItem {
  /** Item ID */
  id: string;
  /** Item name */
  name: string;
  /** Category */
  category: string;
  /** Quantity requested */
  quantity: number;
  /** Unit (e.g., kg, pcs, boxes) */
  unit: string;
  /** Notes */
  notes?: string;
}

// =============================================================================
// Logistics Item
// =============================================================================

export type LogisticsItem = SupplyItem;

// =============================================================================
// Transport
// =============================================================================

export interface Transport {
  /** Transport ID */
  id: string;
  /** Transport type */
  type: TransportType;
  /** Vehicle number */
  vehicleNumber?: string;
  /** Driver name */
  driverName?: string;
  /** Driver phone */
  driverPhone?: string;
  /** Capacity */
  capacity?: number;
  /** Status */
  status?: string;
}

// =============================================================================
// Logistics Request
// =============================================================================

export interface LogisticsRequest {
  /** Request ID */
  id: string;
  /** Incident ID */
  incidentId: string;
  /** Request number */
  requestNumber?: string;
  /** Requested by user ID */
  requestedBy: string;
  /** Requested by name */
  requestedByName?: string;
  /** Priority */
  priority: RequestPriority;
  /** Status */
  status: LogisticsRequestStatus;
  /** Origin warehouse ID */
  originWarehouseId?: string;
  /** Origin warehouse name */
  originWarehouseName?: string;
  /** Destination location */
  destination: GeoLocation;
  /** Destination address */
  destinationAddress?: string;
  /** Supply items */
  items: SupplyItem[];
  /** Transport */
  transport?: Transport;
  /** Estimated arrival */
  estimatedArrival?: string;
  /** Actual arrival */
  actualArrival?: string;
  /** Notes */
  notes?: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

// =============================================================================
// Logistics Stats
// =============================================================================

export interface LogisticsStats {
  /** Total requests */
  totalRequests: number;
  /** Pending requests */
  pendingRequests: number;
  /** In transit */
  inTransit: number;
  /** Delivered */
  delivered: number;
  /** Cancelled */
  cancelled: number;
  /** Total items delivered */
  totalItemsDelivered: number;
  /** Total value (IDR) */
  totalValue?: number;
}

// =============================================================================
// Logistics Filter
// =============================================================================

export interface LogisticsFilter {
  /** Filter by incident ID */
  incidentId?: string;
  /** Filter by status */
  status?: LogisticsRequestStatus;
  /** Filter by priority */
  priority?: RequestPriority;
  /** Filter by warehouse ID */
  warehouseId?: string;
  /** Search query */
  search?: string;
}

// =============================================================================
// Fulfillment
// =============================================================================

export interface Fulfillment {
  /** Fulfillment ID */
  id: string;
  /** Request ID */
  requestId: string;
  /** Warehouse ID */
  warehouseId: string;
  /** Warehouse name */
  warehouseName?: string;
  /** Items fulfilled */
  items: SupplyItem[];
  /** Dispatched at */
  dispatchedAt?: string;
  /** Delivered at */
  deliveredAt?: string;
  /** Status */
  status: LogisticsSupplyStatus;
  /** Notes */
  notes?: string;
}