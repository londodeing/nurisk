/**
 * useResources Hook
 * 100% SDK-driven - uses canonical ListResponse from backend
 * 
 * IMPORTANT: This hook uses ListResponse<T> as the single source of truth.
 * ListResponse = { items: T[], pagination: {...} }
 * 
 * NO FALLBACK MASKING - errors propagate to UI for visibility.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { Resource, ResourceType, ResourceForecast, ResourceOptimization } from '@nurisk/shared-types/resource';
import type { ListResponse, PaginationMeta } from '@nurisk/shared-types/api';
import { extractListItems, extractPagination, hasListData, getListTotal } from '@/lib/list-response';

// Re-export types for consumers
export type { Resource, ResourceType, ResourceForecast, ResourceOptimization };
export type { ListResponse, PaginationMeta };

// =============================================================================
// useResources - Using Canonical ListResponse
// =============================================================================

/**
 * Get all resources with canonical ListResponse
 * 
 * @returns ListResponse with items and pagination
 * 
 * Usage:
 * const { data, isLoading, isError, error } = useResources();
 * const resources = data?.items ?? [];
 * const pagination = data?.pagination;
 */
export function useResources(options: { type?: ResourceType } = {}) {
  const { type } = options;
  
  return useQuery({
    queryKey: ['resources', type],
    queryFn: async () => {
      const data = type
        ? await sdk.resource.list({ type })
        : await sdk.resource.list();
      
      // SDK now returns ListResponse directly - no wrapping needed
      return data;
    },
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// useResourceStats
// =============================================================================

export function useResourceStats() {
  return useQuery({
    queryKey: ['resource-stats'],
    queryFn: async () => {
      const data = await sdk.resource.getStats();
      return data;
    },
    staleTime: 60 * 1000,
  });
}

// =============================================================================
// useResourceForecast
// =============================================================================

export function useResourceForecast(type?: ResourceType) {
  return useQuery({
    queryKey: ['resource-forecast', type],
    queryFn: async () => {
      const data = await sdk.resource.getForecast(type);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// useResourceOptimization
// =============================================================================

export function useResourceOptimization() {
  return useQuery({
    queryKey: ['resource-optimization'],
    queryFn: async () => {
      const data = await sdk.resource.getOptimization();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// useResourceAllocation - Mutations
// =============================================================================

export function useResourceAllocation() {
  return useQuery({
    queryKey: ['resource-allocation'],
    queryFn: async () => {
      // Allocation is handled via mutations
      throw new Error('Use mutation for allocation');
    },
    staleTime: 0,
    enabled: false,
  });
}

/**
 * Allocate resource to incident
 */
export function useAllocateResource() {
  return useMutation({
    mutationFn: async ({
      resourceId,
      incidentId,
      quantity,
    }: {
      resourceId: string;
      incidentId: string;
      quantity: number;
    }) => {
      await sdk.resource.allocate({
        resourceId,
        incidentId,
        quantity,
        assignedAt: new Date().toISOString(),
        assignedBy: 'current-user',
      });
    },
  });
}

/**
 * Deallocate resource
 */
export function useDeallocateResource() {
  return useMutation({
    mutationFn: async ({
      resourceId,
      incidentId,
    }: {
      resourceId: string;
      incidentId: string;
    }) => {
      await sdk.resource.deallocate(resourceId, incidentId);
    },
  });
}

// =============================================================================
// Utility exports for consumers
// =============================================================================

/**
 * Extract resources array from query data
 */
export function getResourcesFromData(data: ListResponse<Resource> | undefined): Resource[] {
  return data?.items ?? [];
}

/**
 * Check if resources exist
 */
export function hasResources(data: ListResponse<Resource> | undefined): boolean {
  return hasListData(data);
}

/**
 * Get total resource count
 */
export function getResourceCount(data: ListResponse<Resource> | undefined): number {
  return getListTotal(data);
}

/**
 * Get pagination metadata
 */
export function getResourcePagination(data: ListResponse<Resource> | undefined): PaginationMeta {
  return extractPagination(data);
}