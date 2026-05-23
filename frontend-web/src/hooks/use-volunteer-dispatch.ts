'use client';

/**
 * useVolunteerDispatch Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { volunteerDispatchApi } from '@nurisk/sdk';
import type { Incident, SkillMatch, Deployment } from '@nurisk/shared-types/volunteer-dispatch';

/**
 * Get nearby volunteers for an incident
 * SDK METHOD MISSING: getNearbyVolunteers - using getDeployments as fallback
 */
export function useNearbyVolunteers(
  incidentId: string,
  requiredSkills: string[],
  limit = 10
) {
  return useQuery({
    queryKey: ['nearby-volunteers', incidentId, requiredSkills, limit],
    queryFn: () => volunteerDispatchApi.getDeployments({ incidentId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all available volunteers
 * SDK METHOD MISSING: getAvailableVolunteers - using getDeployments as fallback
 */
export function useAvailableVolunteers() {
  return useQuery({
    queryKey: ['available-volunteers'],
    queryFn: () => volunteerDispatchApi.getDeployments(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get active incidents that need volunteers
 * SDK METHOD MISSING: getActiveIncidents - using getDeployments as fallback
 */
export function useActiveIncidents() {
  return useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => volunteerDispatchApi.getDeployments({ status: 'pending' }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get incident details
 * SDK METHOD MISSING: getIncident - using getDeploymentById as fallback
 */
export function useIncident(incidentId: string) {
  return useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => volunteerDispatchApi.getDeploymentById(incidentId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get deployment history
 */
export function useDeployments(incidentId?: string) {
  return useQuery({
    queryKey: ['deployments', incidentId],
    queryFn: () => volunteerDispatchApi.getDeployments({ incidentId }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Deploy volunteers mutation
 */
export function useDeployVolunteers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { volunteerId: string; incidentId: string; role: string; startAt: string }) =>
      volunteerDispatchApi.dispatch(request),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['available-volunteers'] });
    },
  });
}

/**
 * Accept deployment mutation
 * SDK METHOD MISSING: acceptDeployment - using updateStatus as fallback
 */
export function useAcceptDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deploymentId: string) =>
      volunteerDispatchApi.updateStatus(deploymentId, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

/**
 * Reject deployment mutation
 * SDK METHOD MISSING: rejectDeployment - using cancel as fallback
 */
export function useRejectDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deploymentId: string) => volunteerDispatchApi.cancel(deploymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

/**
 * Complete deployment mutation
 * SDK METHOD MISSING: completeDeployment - using updateStatus as fallback
 */
export function useCompleteDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deploymentId: string) =>
      volunteerDispatchApi.updateStatus(deploymentId, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });
}

/**
 * Get all dispatch data (aggregated)
 */
export function useDispatchData(incidentId: string) {
  const incident = useIncident(incidentId);
  const nearby = useNearbyVolunteers(
    incidentId,
    incident.data?.requiredSkills || [],
    10
  );
  const deployments = useDeployments(incidentId);

  const data: {
    incident: Incident | null;
    matches: SkillMatch[];
    deployments: Deployment[];
  } = {
    incident: incident.data ?? null,
    matches: nearby.data ?? [],
    deployments: deployments.data ?? [],
  };

  const isLoading = incident.isLoading || nearby.isLoading || deployments.isLoading;
  const isError = incident.isError || nearby.isError || deployments.isError;

  return {
    data,
    isLoading,
    isError,
  };
}