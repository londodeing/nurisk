/**
 * useIncidents Hook
 * 100% SDK-driven - uses canonical ListResponse from backend
 * 
 * IMPORTANT: This hook uses ListResponse<T> as the single source of truth.
 * ListResponse = { items: T[], pagination: {...} }
 * 
 * NO FALLBACK MASKING - errors propagate to UI for visibility.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';
import type { Incident, IncidentFilter } from '@nurisk/shared-types/incident';
import type { ListResponse, PaginationMeta } from '@nurisk/shared-types/api';
import { extractListItems, extractPagination, hasListData, getListTotal } from '@/lib/list-response';

// Query keys
const queryKeys = {
  incidents: {
    all: ['incidents'] as const,
    lists: () => ['incidents', 'list'] as const,
    list: (filters?: IncidentFilter) => ['incidents', 'list', filters] as const,
    details: () => ['incidents', 'detail'] as const,
    detail: (id: string) => ['incidents', 'detail', id] as const,
    stats: () => ['incidents', 'stats'] as const,
    map: () => ['incidents', 'map'] as const,
  },
};

// Assessment interface (separate domain, not part of canonical Incident)
export interface IncidentAssessment {
  id: string;
  incidentId: string;
  assessedBy: string;
  assessedAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedPopulation: number;
  damagedBuildings: number;
  infrastructureDamage: string;
  evacuationCenters: string[];
  needs: string[];
  recommendations: string[];
}

// Re-export ListResponse for consumers
export type { ListResponse, PaginationMeta };

// ============================================
// API Functions - Using Canonical ListResponse
// ============================================

/**
 * Fetch incidents - returns canonical ListResponse
 * NO FALLBACK MASKING - throws on invalid response
 */
async function fetchIncidents(filters?: IncidentFilter): Promise<ListResponse<Incident>> {
  const response = await sdkClient.get<ListResponse<Incident>>('/incidents', { params: filters });
  return response.data as ListResponse<Incident>;
}

/**
 * Fetch single incident by ID
 */
async function fetchIncident(id: string): Promise<Incident> {
  const response = await sdkClient.get<Incident>(`/incidents/${id}`);
  return response.data as Incident;
}

/**
 * Create new incident
 */
async function createIncident(incident: Partial<Incident>): Promise<Incident> {
  const response = await sdkClient.post<Incident>('/incidents', incident);
  return response.data as Incident;
}

/**
 * Update incident
 */
async function updateIncident(id: string, incident: Partial<Incident>): Promise<Incident> {
  const response = await sdkClient.patch<Incident>(`/incidents/${id}`, incident);
  return response.data as Incident;
}

/**
 * Delete incident
 */
async function deleteIncident(id: string): Promise<void> {
  await sdkClient.delete<void>(`/incidents/${id}`);
}

/**
 * Fetch incident assessment
 */
async function fetchIncidentAssessment(incidentId: string): Promise<IncidentAssessment> {
  const response = await sdkClient.get<IncidentAssessment>(`/incidents/${incidentId}/assessment`);
  return response.data as IncidentAssessment;
}

/**
 * Update incident assessment
 */
async function updateIncidentAssessment(
  incidentId: string,
  assessment: Partial<IncidentAssessment>
): Promise<IncidentAssessment> {
  const response = await sdkClient.patch<IncidentAssessment>(`/incidents/${incidentId}/assessment`, assessment);
  return response.data as IncidentAssessment;
}

/**
 * Fetch full report (SITREP PDF)
 */
async function fetchFullReport(incidentId: string): Promise<{ url: string }> {
  const response = await sdkClient.get<{ url: string }>(`/incidents/${incidentId}/full-report`);
  return response.data as { url: string };
}

// ============================================
// Hooks: List & Detail
// ============================================

/**
 * Get all incidents with canonical ListResponse
 * 
 * @returns ListResponse with items and pagination
 * 
 * Usage:
 * const { data, isLoading, isError, error } = useIncidents();
 * const incidents = data?.items ?? [];
 * const pagination = data?.pagination;
 */
export function useIncidents(filters?: IncidentFilter) {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => fetchIncidents(filters),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Get single incident by ID
 */
export function useIncident(id: string) {
  return useQuery({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: () => fetchIncident(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ============================================
// Hooks: CRUD Mutations
// ============================================

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Incident> }) =>
      updateIncident(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(id) });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}

// ============================================
// Hooks: Assessment
// ============================================

export function useIncidentAssessment(incidentId: string) {
  return useQuery({
    queryKey: [...queryKeys.incidents.detail(incidentId), 'assessment'],
    queryFn: () => fetchIncidentAssessment(incidentId),
    enabled: !!incidentId,
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      incidentId,
      assessment,
    }: {
      incidentId: string;
      assessment: Partial<IncidentAssessment>;
    }) => updateIncidentAssessment(incidentId, assessment),
    onSuccess: (_, { incidentId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.incidents.detail(incidentId), 'assessment'],
      });
    },
  });
}

// ============================================
// Hooks: Full Report (SITREP PDF)
// ============================================

export function useFullReport(incidentId: string) {
  return useQuery({
    queryKey: [...queryKeys.incidents.detail(incidentId), 'full-report'],
    queryFn: () => fetchFullReport(incidentId),
    enabled: !!incidentId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Hooks: Optimistic Updates
// ============================================

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ incidentId, status }: { incidentId: string; status: Incident['status'] }) =>
      updateIncident(incidentId, { status }),

    onMutate: async ({ incidentId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.incidents.all });
      await queryClient.cancelQueries({
        queryKey: queryKeys.incidents.detail(incidentId),
      });

      const previousIncidents = queryClient.getQueryData(queryKeys.incidents.list());
      const previousIncident = queryClient.getQueryData(
        queryKeys.incidents.detail(incidentId)
      );

      // Update ListResponse items
      queryClient.setQueriesData(
        { queryKey: queryKeys.incidents.lists() },
        (old: ListResponse<Incident> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((incident) =>
              incident.id === incidentId ? { ...incident, status } : incident
            ),
          };
        }
      );

      return { previousIncidents, previousIncident };
    },

    onError: (_err, { incidentId }, context) => {
      if (context?.previousIncidents) {
        queryClient.setQueryData(
          queryKeys.incidents.list(),
          context.previousIncidents
        );
      }
      if (context?.previousIncident) {
        queryClient.setQueryData(
          queryKeys.incidents.detail(incidentId),
          context.previousIncident
        );
      }
    },

    onSettled: (_data, _error, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.detail(incidentId),
      });
    },
  });
}

// ============================================
// Hooks: Statistics
// ============================================

export function useIncidentStats() {
  return useQuery({
    queryKey: queryKeys.incidents.stats(),
    queryFn: async () => {
      const data = await sdkClient.get('/incidents/stats');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

// ============================================
// Hooks: Map Data
// ============================================

export function useIncidentMapData(filters?: IncidentFilter) {
  return useQuery({
    queryKey: queryKeys.incidents.map(),
    queryFn: async () => {
      const data = await sdkClient.get('/incidents/map', { params: filters });
      return data;
    },
    staleTime: 30 * 1000,
  });
}

// ============================================
// Utility exports for consumers
// ============================================

/**
 * Extract incidents array from query data
 * Convenience function for components
 */
export function getIncidentsFromData(data: ListResponse<Incident> | undefined): Incident[] {
  return data?.items ?? [];
}

/**
 * Check if incidents exist
 */
export function hasIncidents(data: ListResponse<Incident> | undefined): boolean {
  return hasListData(data);
}

/**
 * Get total incident count
 */
export function getIncidentCount(data: ListResponse<Incident> | undefined): number {
  return getListTotal(data);
}

/**
 * Get pagination metadata
 */
export function getIncidentPagination(data: ListResponse<Incident> | undefined): PaginationMeta {
  return extractPagination(data);
}