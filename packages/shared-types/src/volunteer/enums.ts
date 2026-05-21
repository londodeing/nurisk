// Volunteer Enums

// =============================================================================
// Volunteer Status
// =============================================================================

export type VolunteerStatus =
  | 'ACTIVE'      // Active and available
  | 'DEPLOYED'    // Deployed to incident
  | 'ON_DUTY'     // On duty
  | 'OFF_DUTY'    // Off duty
  | 'INACTIVE';   // Inactive

// =============================================================================
// Volunteer Type
// =============================================================================

export type VolunteerType =
  | 'RELAWAN_PBNU'    // Provincial volunteer
  | 'RELAWAN_PCNU'    // District volunteer
  | 'RELAWAN_CABANG'  // Branch volunteer
  | 'RELAWAN_DESA';   // Village volunteer

// =============================================================================
// Skill Type
// =============================================================================

export type SkillType =
  | 'FIRST_AID'           // First aid
  | 'SEARCH_RESCUE'       // Search and rescue
  | 'MEDICAL'            // Medical
  | 'LOGISTICS'          // Logistics
  | 'COMMUNICATION'      // Communication/radio
  | 'DRIVING'            // Driving
  | 'COORDINATION'       // Coordination
  | 'EVACUATION'         // Evacuation
  | 'SHELTER_MANAGEMENT'  // Shelter management
  | 'WATER_RESCUE';      // Water rescue

// =============================================================================
// Team Type
// =============================================================================

export type TeamType =
  | 'RESPONSE'      // Quick response team
  | 'MEDICAL'       // Medical team
  | 'LOGISTICS'     // Logistics team
  | 'SEARCH'       // Search and rescue
  | 'EVACUATION'   // Evacuation team
  | 'ASSESSMENT'   // Assessment team
  | 'COORDINATION'; // Coordination team

// =============================================================================
// Team Status
// =============================================================================

export type TeamStatus =
  | 'ACTIVE'      // Active
  | 'DEPLOYED'   // Deployed
  | 'STANDBY'    // On standby
  | 'INACTIVE';  // Inactive

// =============================================================================
// Team Member Role
// =============================================================================

export type TeamMemberRole =
  | 'LEADER'          // Team leader
  | 'DEPUTY_LEADER'  // Deputy leader
  | 'MEMBER';        // Regular member

// =============================================================================
// Assignment Type
// =============================================================================

export type AssignmentType =
  | 'TEAM'         // Team assignment
  | 'INDIVIDUAL';  // Individual assignment

// =============================================================================
// Assignment Status
// =============================================================================

export type AssignmentStatus =
  | 'PENDING'     // Pending
  | 'ACCEPTED'   // Accepted
  | 'DECLINED'   // Declined
  | 'IN_PROGRESS' // In progress
  | 'COMPLETED'  // Completed
  | 'CANCELLED'; // Cancelled

// =============================================================================
// Check-in Type
// =============================================================================

export type CheckInType =
  | 'ARRIVED'      // Arrived at location
  | 'DEPARTED'    // Departed from location
  | 'STATUS_UPDATE'; // Status update