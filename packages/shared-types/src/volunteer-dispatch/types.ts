import type { GeoLocation } from '../common/types';
import type { Incident } from '../incident/types';

// Re-export Incident for volunteer-dispatch context
export type { Incident } from '../incident/types';

// =============================================================================
// Availability Slot
// =============================================================================

export interface AvailabilitySlot {
  volunteerId: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'busy' | 'tentative';
  location?: GeoLocation;
}

export interface Deployment {
  id: string;
  volunteerId: string;
  incidentId: string;
  role: string;
  startAt: string;
  endAt?: string;
  status: 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled';
  location?: GeoLocation;
}

export interface SkillMatch {
  volunteerId: string;
  skill: string;
  proficiency: number;
  matchedTo: string;
  matchScore: number;
}

// =============================================================================
// Dispatch Request
// =============================================================================

export interface DispatchRequest {
  volunteerId: string;
  incidentId: string;
  role: string;
  requestedAt: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}
