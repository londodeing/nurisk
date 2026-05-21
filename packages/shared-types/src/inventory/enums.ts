// Inventory Enums

// =============================================================================
// Supply Category
// =============================================================================

export type SupplyCategory =
  | 'FOOD'           // Food
  | 'WATER'          // Water
  | 'MEDICAL'        // Medical supplies
  | 'CLOTHING'       // Clothing
  | 'BLANKET'        // Blanket
  | 'MATTRESS'       // Mattress
  | 'TENT'           // Tent
  | 'HYGIENE'        // Hygiene kit
  | 'KITCHEN'        // Kitchen equipment
  | 'LIGHTING'       // Lighting
  | 'GENERATOR'      // Generator
  | 'FUEL'           // Fuel
  | 'TRANSPORT';     // Transport equipment

// =============================================================================
// Supply Status
// =============================================================================

export type SupplyStatus =
  | 'AVAILABLE'     // Available
  | 'RESERVED'      // Reserved
  | 'DISTRIBUTED'   // Distributed
  | 'EXPIRED';      // Expired

// =============================================================================
// Supply Request Status
// =============================================================================

export type SupplyRequestStatus =
  | 'PENDING'      // Pending approval
  | 'APPROVED'      // Approved
  | 'REJECTED'     // Rejected
  | 'FULFILLED'    // Fulfilled
  | 'CANCELLED';   // Cancelled

// =============================================================================
// Evacuation Status
// =============================================================================

export type EvacuationStatus =
  | 'PENDING'     // Pending
  | 'IN_PROGRESS'  // In progress
  | 'COMPLETED'   // Completed
  | 'CANCELLED'; // Cancelled