import type { GeoLocation } from '../common/types';

// =============================================================================
// Resource Type
// =============================================================================

export type ResourceType =
  | 'FOOD'
  | 'WATER'
  | 'SHELTER'
  | 'MEDICAL'
  | 'TRANSPORT'
  | 'COMMUNICATION'
  | 'EQUIPMENT'
  | 'CLOTHING'
  | 'HYGIENE'
  | 'OTHER';

// =============================================================================
// Resource
// =============================================================================

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  unit: string;
  status: 'available' | 'allocated' | 'consumed' | 'reserved';
  location: GeoLocation;
  supplier?: string;
  expiryDate?: string;
}

// =============================================================================
// Resource Allocation
// =============================================================================

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  incidentId: string;
  quantity: number;
  allocatedAt: string;
  allocatedBy: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'returned';
}

// =============================================================================
// Resource Forecast
// =============================================================================

export interface ResourceForecast {
  resourceType: string;
  currentStock: number;
  projectedDemand: number;
  shortfall: number;
  recommendedOrder: number;
  confidence: number;
  period: string;
}

// =============================================================================
// Resource Optimization
// =============================================================================

export interface ResourceOptimization {
  resourceId: string;
  resourceName: string;
  currentStock: number;
  requiredStock: number;
  optimalAllocation: number;
  shortage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}
