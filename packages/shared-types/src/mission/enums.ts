// Mission Enums

// =============================================================================
// Mission Status
// =============================================================================

export type MissionStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'

// =============================================================================
// Mission Type
// =============================================================================

export type MissionType =
  | 'RECONNAISSANCE'   // Reconnaissance
  | 'SUPPLY'           // Supply
  | 'EVACUATION'       // Evacuation
  | 'COMBAT_SUPPORT';  // Combat Support
