// Common Enums - Cross-Domain Enums
// Enums that are used across multiple domains

// =============================================================================
// Branch
// =============================================================================

export type Branch =
  | 'headquarters'   // Headquarters
  | 'regional'       // Regional
  | 'local'         // Local
  | 'field';        // Field

// =============================================================================
// Rank
// =============================================================================

export type Rank =
  | 'trainee'     // Trainee
  | 'junior'      // Junior
  | 'senior'      // Senior
  | 'lead'       // Lead
  | 'commander';  // Commander

// =============================================================================
// Incident Source
// =============================================================================

export type IncidentSource =
  | 'sensor'          // Sensor
  | 'manual_report'  // Manual report
  | 'social_media'   // Social media
  | 'emergency_call' // Emergency call
  | 'other';        // Other

// =============================================================================
// Asset Type
// =============================================================================

export type AssetType =
  | 'equipment'    // Equipment
  | 'vehicle'      // Vehicle
  | 'supply'      // Supply
  | 'facility'    // Facility
  | 'personnel';  // Personnel

// =============================================================================
// Transaction Type
// =============================================================================

export type TransactionType =
  | 'allocation'   // Allocation
  | 'transfer'     // Transfer
  | 'consumption'  // Consumption
  | 'maintenance'  // Maintenance
  | 'disposal';   // Disposal

// =============================================================================
// Condition
// =============================================================================

export type Condition =
  | 'new'      // New
  | 'good'    // Good
  | 'fair'    // Fair
  | 'poor'    // Poor
  | 'broken'; // Broken