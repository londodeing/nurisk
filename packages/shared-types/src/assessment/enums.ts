// Assessment Enums

// =============================================================================
// Damage Level
// =============================================================================

export type DamageLevel =
  | 'TOTAL'      // Total destruction
  | 'HEAVY'     // Heavy damage
  | 'MEDIUM'    // Medium damage
  | 'LIGHT';   // Light damage

// =============================================================================
// Impact Category
// =============================================================================

export type ImpactCategory =
  | 'CASUALTIES'      // Human casualties
  | 'INFRASTRUCTURE' // Infrastructure
  | 'ECONOMIC'      // Economic loss
  | 'ENVIRONMENT';  // Environmental

// =============================================================================
// Assessment Type
// =============================================================================

export type AssessmentType =
  | 'INITIAL'      // Initial assessment
  | 'DETAILED'     // Detailed assessment
  | 'FOLLOW_UP';   // Follow-up assessment

// =============================================================================
// Assessment Status
// =============================================================================

export type AssessmentStatus =
  | 'DRAFT'       // Draft
  | 'SUBMITTED'   // Submitted
  | 'VERIFIED'    // Verified
  | 'APPROVED';   // Approved

// =============================================================================
// Damage Report Type
// =============================================================================

export type DamageReportType =
  | 'BUILDING'      // Building damage
  | 'INFRASTRUCTURE' // Infrastructure damage
  | 'AGRICULTURE'  // Agriculture damage
  | 'LIVESTOCK'    // Livestock damage
  | 'PUBLIC_FACILITY'; // Public facility