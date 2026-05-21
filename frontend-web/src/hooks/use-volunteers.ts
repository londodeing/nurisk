/**
 * useVolunteers Hook
 * 100% SDK-driven - uses canonical ListResponse from backend
 * 
 * IMPORTANT: This hook uses ListResponse<T> as the single source of truth.
 * ListResponse = { items: T[], pagination: {...} }
 * 
 * NO FALLBACK MASKING - errors propagate to UI for visibility.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@nurisk/sdk';
import type {
  Volunteer,
  VolunteerStatus,
  VolunteerType,
} from '@nurisk/shared-types/volunteer';
import type { ListResponse, PaginationMeta } from '@nurisk/shared-types/api';
import { extractListItems, extractPagination, hasListData, getListTotal } from '@/lib/list-response';

export type {
  Volunteer,
  VolunteerStatus,
  VolunteerType,
} from '@nurisk/shared-types/volunteer';

export type VolunteerRole = 'relawan' | 'field_staff' | 'commander';

export interface VolunteerFilters {
  page?: number;
  limit?: number;
  status?: VolunteerStatus;
  type?: VolunteerType;
  province?: string;
  regency?: string;
  district?: string;
  search?: string;
}

export type VolunteerFilterState = Partial<VolunteerFilters>;

export interface BulkActionRequest {
  ids: string[];
  action: 'approve' | 'reject' | 'activate' | 'deactivate';
}

export interface RawVolunteerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  type?: string;
  status: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  regency?: string;
  district?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Re-export ListResponse for consumers
export type { ListResponse, PaginationMeta };

/**
 * Map raw volunteer data to canonical Volunteer type
 */
function mapVolunteer(raw: RawVolunteerData): Volunteer {
  return {
    id: raw.id,
    userId: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? '',
    type: (raw.type ?? raw.role ?? 'RELAWAN_DESA') as Volunteer['type'],
    status: (raw.status.toUpperCase() === 'PENDING'
      ? 'ACTIVE'
      : raw.status.toUpperCase() === 'VERIFIED'
      ? 'ACTIVE'
      : raw.status.toUpperCase() === 'REJECTED'
      ? 'INACTIVE'
      : raw.status.toUpperCase()) as Volunteer['status'],
    skills: [],
    organization: '',
    province: raw.province ?? (raw.location?.split(',')[0]?.trim()),
    regency: raw.regency ?? (raw.location?.split(',')[1]?.trim()),
    district: raw.district ?? (raw.location?.split(',')[2]?.trim()),
    joinedAt: raw.createdAt,
    lastActiveAt: raw.updatedAt,
    totalMissions: 0,
    totalHours: 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

// ============================================
// API Functions - Using Canonical ListResponse
// ============================================

/**
 * Fetch volunteers - returns canonical ListResponse
 * NO FALLBACK MASKING - throws on invalid response
 */
async function fetchVolunteers(
  params?: VolunteerFilters
): Promise<ListResponse<Volunteer>> {
  const response = await client.get<ListResponse<Volunteer>>('/volunteers', { params });
  
  // Map raw data to Volunteer type
  return {
    items: response.data.items.map(mapVolunteer),
    pagination: response.data.pagination,
  };
}

/**
 * Fetch single volunteer by ID
 */
async function fetchVolunteer(id: string): Promise<Volunteer> {
  const response = await client.get<RawVolunteerData>(`/volunteers/${id}`);
  return mapVolunteer(response.data as RawVolunteerData);
}

/**
 * Update volunteer
 */
async function updateVolunteer(
  id: string,
  body: Partial<Volunteer>
): Promise<Volunteer> {
  const response = await client.patch<RawVolunteerData>(`/volunteers/${id}`, body);
  return mapVolunteer(response.data as RawVolunteerData);
}

/**
 * Update volunteer status
 */
async function updateVolunteerStatus(
  id: string,
  status: VolunteerStatus
): Promise<Volunteer> {
  const response = await client.patch<RawVolunteerData>(`/volunteers/${id}/status`, { status });
  return mapVolunteer(response.data as RawVolunteerData);
}

/**
 * Bulk action on volunteers
 */
async function bulkAction(request: BulkActionRequest): Promise<Volunteer[]> {
  const response = await client.post<RawVolunteerData[]>('/volunteers/bulk-action', request);
  return response.data.map(mapVolunteer);
}

/**
 * Assign volunteer to incident
 */
async function assignToIncident(
  volunteerId: string,
  incidentId: string,
  role: string
): Promise<Volunteer> {
  const response = await client.post<RawVolunteerData>(`/volunteers/${volunteerId}/assign`, {
    incidentId,
    role,
  });
  return mapVolunteer(response.data as RawVolunteerData);
}

// ============================================
// Hooks
// ============================================

/**
 * Get all volunteers with canonical ListResponse
 * 
 * @returns ListResponse with items and pagination
 * 
 * Usage:
 * const { data, isLoading, isError, error } = useVolunteers();
 * const volunteers = data?.items ?? [];
 * const pagination = data?.pagination;
 */
export function useVolunteers(params?: VolunteerFilters) {
  return useQuery({
    queryKey: ['volunteers', params],
    queryFn: () => fetchVolunteers(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Get single volunteer by ID
 */
export function useVolunteer(id: string) {
  return useQuery({
    queryKey: ['volunteer', id],
    queryFn: () => fetchVolunteer(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Update volunteer mutation
 */
export function useUpdateVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Volunteer> }) =>
      updateVolunteer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer', variables.id] });
    },
  });
}

/**
 * Update volunteer status mutation
 */
export function useUpdateVolunteerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VolunteerStatus }) =>
      updateVolunteerStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer', variables.id] });
    },
  });
}

/**
 * Bulk action mutation
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkActionRequest) => bulkAction(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
  });
}

/**
 * Assign to incident mutation
 */
export function useAssignToIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      volunteerId,
      incidentId,
      role,
    }: {
      volunteerId: string;
      incidentId: string;
      role: string;
    }) => assignToIncident(volunteerId, incidentId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({
        queryKey: ['volunteer', variables.volunteerId],
      });
    },
  });
}

// ============================================
// Utility exports for consumers
// ============================================

/**
 * Extract volunteers array from query data
 */
export function getVolunteersFromData(data: ListResponse<Volunteer> | undefined): Volunteer[] {
  return data?.items ?? [];
}

/**
 * Check if volunteers exist
 */
export function hasVolunteers(data: ListResponse<Volunteer> | undefined): boolean {
  return hasListData(data);
}

/**
 * Get total volunteer count
 */
export function getVolunteerCount(data: ListResponse<Volunteer> | undefined): number {
  return getListTotal(data);
}

/**
 * Get pagination metadata
 */
export function getVolunteerPagination(data: ListResponse<Volunteer> | undefined): PaginationMeta {
  return extractPagination(data);
}