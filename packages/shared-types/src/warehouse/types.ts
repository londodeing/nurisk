// Warehouse Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { WarehouseStatus, MovementType, WarehouseCrewRole } from './enums';

// =============================================================================
// Warehouse
// =============================================================================

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  region: string;
  location: GeoLocation;
  capacity: number;
  currentStock: number;
  status: WarehouseStatus;
  picId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Warehouse Stock
// =============================================================================

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  itemName: string;
  itemType: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  lastUpdated: string;
}

// =============================================================================
// Warehouse Movement
// =============================================================================

export interface WarehouseMovement {
  id: string;
  warehouseId: string;
  stockId: string;
  type: MovementType;
  quantity: number;
  reference?: string;
  notes?: string;
  movedBy: string;
  movedAt: string;
}

// =============================================================================
// Warehouse Crew
// =============================================================================

export interface WarehouseCrew {
  id: string;
  warehouseId: string;
  volunteerId: string;
  volunteerName: string;
  role: WarehouseCrewRole;
  shiftStart: string;
  shiftEnd?: string;
  status: 'ASSIGNED' | 'ON_DUTY' | 'OFF_DUTY';
  assignedAt: string;
  assignedBy: string;
}

// =============================================================================
// Warehouse Equipment
// =============================================================================

export interface WarehouseEquipment {
  id: string;
  warehouseId: string;
  name: string;
  type: 'FORKLIFT' | 'PALLET' | 'FREEZER' | 'TRUCK' | 'RADIO' | 'GENERATOR';
  quantity: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN';
  assignedTo?: string;
}

// =============================================================================
// Warehouse Assignment
// =============================================================================

export interface WarehouseAssignment {
  warehouseId: string;
  incidentId?: string;
  shelterId?: string;
  assignedAt: string;
  assignedBy: string;
}

// =============================================================================
// Form Types
// =============================================================================

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  address: string;
  region: string;
  location: GeoLocation;
  capacity: number;
}

export interface UpdateWarehouseRequest {
  name?: string;
  address?: string;
  region?: string;
  location?: GeoLocation;
  capacity?: number;
  status?: WarehouseStatus;
}

export interface AssignWarehousePICRequest {
  warehouseId: string;
  volunteerId: string;
  assignedBy: string;
}

export interface AssignWarehouseCrewRequest {
  warehouseId: string;
  volunteerId: string;
  role: WarehouseCrewRole;
  shiftStart: string;
  shiftEnd?: string;
  assignedBy: string;
}

export interface CreateStockRequest {
  warehouseId: string;
  itemName: string;
  itemType: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
}

export interface MovementRequest {
  warehouseId: string;
  stockId: string;
  type: MovementType;
  quantity: number;
  reference?: string;
  notes?: string;
  movedBy: string;
}

// =============================================================================
// Warehouse Inventory
// =============================================================================

export interface WarehouseInventory {
  /** Warehouse ID */
  warehouseId: string;
  /** Total items count */
  totalItems: number;
  /** Total quantity */
  totalQuantity: number;
  /** Items breakdown */
  items: WarehouseStock[];
  /** Last updated */
  lastUpdated: string;
}

// =============================================================================
// Warehouse Filter
// =============================================================================

export interface WarehouseFilter {
  /** Filter by type */
  type?: string;
  /** Filter by region */
  region?: string;
  /** Filter by status */
  status?: WarehouseStatus;
  /** Search query */
  search?: string;
}