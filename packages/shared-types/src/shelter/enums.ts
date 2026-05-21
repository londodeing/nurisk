// Shelter Enums

// =============================================================================
// Shelter Status
// =============================================================================

export type ShelterStatus =
  | 'AKTIF'
  | 'FULL'
  | 'CLOSED';

// =============================================================================
// Shelter Capacity Status
// =============================================================================

export type ShelterCapacityStatus =
  | 'AVAILABLE'
  | 'WARNING'
  | 'FULL'
  | 'OVERCAPACITY';

// =============================================================================
// Shelter Crew Role
// =============================================================================

export type ShelterCrewRole =
  | 'LOGISTICS'
  | 'MEDICAL'
  | 'SECURITY'
  | 'KITCHEN'
  | 'REGISTRATION'
  | 'COMMUNICATION'
  | 'TRANSPORT'
  | 'WAREHOUSE';