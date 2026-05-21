// Warehouse Enums

// =============================================================================
// Warehouse Status
// =============================================================================

export type WarehouseStatus =
  | 'ACTIVE'
  | 'LIMITED'
  | 'FULL'
  | 'MAINTENANCE'
  | 'INACTIVE';

// =============================================================================
// Movement Type
// =============================================================================

export type MovementType =
  | 'INBOUND'
  | 'OUTBOUND'
  | 'TRANSFER'
  | 'ADJUSTMENT';

// =============================================================================
// Warehouse Crew Role
// =============================================================================

export type WarehouseCrewRole =
  | 'LOGISTICS'
  | 'INVENTORY'
  | 'SECURITY'
  | 'TRANSPORT'
  | 'FORKLIFT'
  | 'CLERK';