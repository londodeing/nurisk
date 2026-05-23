'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWarnings,
  getActiveWarnings,
  getWarning,
  createWarning,
  updateWarning,
  deleteWarning,
  dismissWarning,
  broadcastWarning,
  getBmkgFeed,
  getHistoricalEvents,
  type WarningCreateRequest,
} from '@/services/earlyWarningService';
import type { Warning, WarningFilter } from '@nurisk/shared-types/early-warning';

/**
 * Get all warnings with filters
 */
export function useWarnings(filters?: WarningFilter) {
  return useQuery({
    queryKey: ['warnings', filters],
    queryFn: () => getWarnings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get active warnings only
 */
export function useActiveWarnings() {
  return useQuery({
    queryKey: ['warnings', 'active'],
    queryFn: getActiveWarnings,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get single warning by ID
 */
export function useWarning(id: string) {
  return useQuery({
    queryKey: ['warning', id],
    queryFn: () => getWarning(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Get BMKG feed
 */
export function useBmkgFeed() {
  return useQuery({
    queryKey: ['warnings', 'bmkg'],
    queryFn: getBmkgFeed,
    staleTime: 15 * 60 * 1000, // 15 minutes for BMKG feed
  });
}

/**
 * Get historical similar events
 */
export function useHistoricalEvents(
  type: string,
  areaId: string,
  limit = 10
) {
  return useQuery({
    queryKey: ['warnings', 'history', type, areaId, limit],
    queryFn: () => getHistoricalEvents(type as any, areaId, limit),
    staleTime: 30 * 60 * 1000,
    enabled: !!type && !!areaId,
  });
}

/**
 * Create warning mutation (admin)
 */
export function useCreateWarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (warning: WarningCreateRequest) => createWarning(warning),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
    },
  });
}

/**
 * Update warning mutation (admin)
 */
export function useUpdateWarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      warning,
    }: {
      id: string;
      warning: Partial<WarningCreateRequest>;
    }) => updateWarning(id, warning),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
      queryClient.invalidateQueries({ queryKey: ['warning', variables.id] });
    },
  });
}

/**
 * Delete warning mutation (admin)
 */
export function useDeleteWarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWarning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
    },
  });
}

/**
 * Dismiss warning mutation
 */
export function useDismissWarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dismissWarning(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
      queryClient.invalidateQueries({ queryKey: ['warning', id] });
    },
  });
}

/**
 * Broadcast warning mutation (admin)
 */
export function useBroadcastWarning() {
  return useMutation({
    mutationFn: ({
      id,
      channels,
    }: {
      id: string;
      channels?: string[];
    }) => broadcastWarning(id, channels),
  });
}

/**
 * Get all warning data (aggregated)
 */
export function useAllWarningData(filters?: WarningFilter) {
  const warnings = useWarnings(filters);
  const activeWarnings = useActiveWarnings();
  const bmkgFeed = useBmkgFeed();

  const data: Warning[] = warnings.data ?? [];
  const active: Warning[] = activeWarnings.data ?? [];
  const bmkg: Warning[] = bmkgFeed.data ?? [];

  const isLoading = warnings.isLoading || activeWarnings.isLoading;
  const isError = warnings.isError || activeWarnings.isError;

  return {
    data,
    active,
    bmkg,
    isLoading,
    isError,
  };
}

/**
 * Auto-dismiss expired warnings hook
 */
export function useAutoDismissWarnings() {
  const queryClient = useQueryClient();

  const { data: warnings } = useWarnings();

  if (warnings) {
    const now = new Date();
    warnings.forEach((warning) => {
      if (warning.status === 'ACTIVE' && new Date(warning.expiresAt) < now) {
        queryClient.setQueryData<Warning[]>(['warnings', undefined], (old) => {
          if (!old) return old;
          return old.map((w) =>
            w.id === warning.id ? { ...w, status: 'EXPIRED' as const } : w
          );
        });
      }
    });
  }
}