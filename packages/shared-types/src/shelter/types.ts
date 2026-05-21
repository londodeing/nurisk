// Shelter Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { ShelterStatus, ShelterCapacityStatus, ShelterCrewRole } from './enums';

// =============================================================================
// Shelter
// =============================================================================

export interface Shelter {
  id: string;
  name: string;
  code: string;
  address: string;
  region: string;
  location: GeoLocation;
  capacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  capacityStatus: ShelterCapacityStatus;
  incidentId?: string;
  commanderId?: string;
  picId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Shelter Activation
// =============================================================================

export interface ShelterActivation {
  shelterId: string;
  status: ShelterStatus;
  activatedBy?: string;
  activatedAt?: string;
  commanderApprovedBy?: string;
  commanderApprovedAt?: string;
  notes?: string;
}

// =============================================================================
// Shelter Capacity
// =============================================================================

export interface ShelterCapacity {
  /** Total capacity */
  total: number;
  /** Current occupancy */
  currentOccupancy: number;
  /** Available slots */
  available: number;
  /** Capacity percentage */
  percentage: number;
  /** Capacity status */
  status: ShelterCapacityStatus;
}

// =============================================================================
// Shelter Occupancy
// =============================================================================

export interface ShelterOccupancy {
  shelterId: string;
  total: number;
  male: number;
  female: number;
  children: number;
  elderly: number;
  specialNeeds: number;
  lastUpdated: string;
}

// =============================================================================
// Shelter Amenity
// =============================================================================

export interface ShelterAmenity {
  id: string;
  shelterId: string;
  type: 'TOILET' | 'SHOWER' | 'KITCHEN' | 'CLINIC' | 'PRAYER_ROOM' | 'PLAYGROUND';
  quantity: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN';
}

// =============================================================================
// Shelter Equipment
// =============================================================================

export interface ShelterEquipment {
  id: string;
  shelterId: string;
  name: string;
  type: 'GENERATOR' | 'TENT' | 'RADIO' | 'LAMP' | 'KITCHEN_SET' | 'BLANKET' | 'MATTRESS' | 'FIRST_AID';
  quantity: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN';
  assignedTo?: string;
}

// =============================================================================
// Shelter Crew Assignment
// =============================================================================

export interface ShelterCrewAssignment {
  id: string;
  shelterId: string;
  volunteerId: string;
  volunteerName: string;
  role: ShelterCrewRole;
  shiftStart: string;
  shiftEnd?: string;
  status: 'ASSIGNED' | 'ON_DUTY' | 'OFF_DUTY';
  assignedAt: string;
  assignedBy: string;
}

// =============================================================================
// Shelter PIC
// =============================================================================

export interface ShelterPIC {
  shelterId: string;
  volunteerId: string;
  volunteerName: string;
  phone: string;
  assignedAt: string;
  assignedBy: string;
}

// =============================================================================
// Shelter Mission Assignment
// =============================================================================

export interface ShelterMissionAssignment {
  shelterId: string;
  incidentId: string;
  incidentName: string;
  assignedAt: string;
  assignedBy: string;
}

// =============================================================================
// Shelter Timeline Event
// =============================================================================

export interface ShelterTimelineEvent {
  id: string;
  shelterId: string;
  type: 'CREATED' | 'STATUS_CHANGED' | 'PIC_ASSIGNED' | 'CREW_ASSIGNED' | 'EQUIPMENT_ASSIGNED' | 'OCCUPANCY_UPDATED';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

// =============================================================================
// Form Types
// =============================================================================

export interface CreateShelterRequest {
  name: string;
  code: string;
  address: string;
  region: string;
  location: GeoLocation;
  capacity: number;
  incidentId?: string;
}

export interface UpdateShelterRequest {
  name?: string;
  address?: string;
  region?: string;
  location?: GeoLocation;
  capacity?: number;
  status?: ShelterStatus;
}

export interface ActivateShelterRequest {
  shelterId: string;
  commanderApprovedBy: string;
  notes?: string;
}

export interface AssignPICRequest {
  shelterId: string;
  volunteerId: string;
  assignedBy: string;
}

export interface AssignCrewRequest {
  shelterId: string;
  volunteerId: string;
  role: ShelterCrewRole;
  shiftStart: string;
  shiftEnd?: string;
  assignedBy: string;
}

export interface UpdateOccupancyRequest {
  shelterId: string;
  total: number;
  male: number;
  female: number;
  children: number;
  elderly: number;
  specialNeeds: number;
  updatedBy: string;
}

// =============================================================================
// Shelter Filter
// =============================================================================

export interface ShelterFilter {
  /** Filter by status */
  status?: ShelterStatus;
  /** Filter by region */
  region?: string;
  /** Filter by incident */
  incidentId?: string;
  /** Search query */
  search?: string;
}