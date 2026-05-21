// Logistics Enums

// =============================================================================
// Logistics Supply Status
// =============================================================================

export type LogisticsSupplyStatus =
  | 'PENDING'      // Pending approval
  | 'APPROVED'     // Approved
  | 'IN_TRANSIT'    // In transit
  | 'DELIVERED'    // Delivered
  | 'CANCELLED';   // Cancelled

// =============================================================================
// Request Priority
// =============================================================================

export type RequestPriority =
  | 'CRITICAL'     // Critical - immediate response
  | 'HIGH'        // High priority
  | 'MEDIUM'      // Medium priority
  | 'LOW';       // Low priority

// =============================================================================
// Transport Type
// =============================================================================

export type TransportType =
  | 'TRUCK'       // Truck
  | 'VAN'         // Van
  | 'MOTORCYCLE'  // Motorcycle
  | 'BOAT'        // Boat
  | 'HELICOPTER'  // Helicopter
  | 'AIRPLANE';   // Airplane

// =============================================================================
// Logistics Request Status
// =============================================================================

export type LogisticsRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'FULFILLED'
  | 'REJECTED'
  | 'CANCELLED'