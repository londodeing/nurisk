'use client';

/**
 * useBriefing Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery } from '@tanstack/react-query';
import { briefingApi } from '@nurisk/sdk';
import type { SituationSummary, KeyMetrics } from '@nurisk/shared-types/briefing';

// Mock data for development fallback
const MOCK_BRIEFING = {
  situation: { activeIncidents: 0, criticalAlerts: 0, resourcesDeployed: 0 } as SituationSummary,
  metrics: { totalIncidents: 0, resolvedIncidents: 0 } as KeyMetrics,
  actions: [] as RecommendedAction[],
};

const MOCK_INCIDENT_BRIEFS: IncidentBrief[] = [];

// Types
interface RecommendedAction {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface IncidentBrief {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
}

/**
 * Generate executive briefing
 * SDK METHOD MISSING: generateBriefing - using generate as fallback
 */
export function useBriefing(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery({
    queryKey: ['briefing', period],
    queryFn: () => briefingApi.generate(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get briefing history
 * SDK METHOD MISSING: getBriefingHistory - using list as fallback
 */
export function useBriefingHistory(limit = 10) {
  return useQuery({
    queryKey: ['briefing-history', limit],
    queryFn: () => briefingApi.list({ limit }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get current situation summary
 * SDK METHOD MISSING: getSituationSummary - using getLatest as fallback
 */
export function useSituationSummary() {
  return useQuery({
    queryKey: ['situation-summary'],
    queryFn: () => briefingApi.getLatest(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get key metrics
 */
export function useKeyMetrics() {
  return useQuery({
    queryKey: ['key-metrics'],
    queryFn: () => briefingApi.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get recommended actions
 * SDK METHOD MISSING: getRecommendedActions - using getLatest as fallback
 */
export function useRecommendedActions() {
  return useQuery({
    queryKey: ['recommended-actions'],
    queryFn: async () => {
      const briefing = await briefingApi.getLatest();
      if (!briefing?.recommendedActions) {
        throw new Error('[briefing/recommended-actions] Invalid response: missing recommendedActions field');
      }
      return briefing.recommendedActions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get incident briefs
 * SDK METHOD MISSING: getIncidentBriefs - using list as fallback
 */
export function useIncidentBriefs() {
  return useQuery({
    queryKey: ['incident-briefs'],
    queryFn: async () => {
      const briefings = await briefingApi.list({ limit: 10 });
      return briefings.map((b) => ({
        id: b.id,
        title: b.title,
        severity: b.priority,
        location: b.region,
      })) as IncidentBrief[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get all briefing data (aggregated)
 */
export function useBriefingData() {
  const situation = useSituationSummary();
  const metrics = useKeyMetrics();
  const actions = useRecommendedActions();
  const incidents = useIncidentBriefs();

  // Use mock data in development if API fails
  const data: {
    situation: SituationSummary;
    metrics: KeyMetrics;
    actions: RecommendedAction[];
    incidents: IncidentBrief[];
  } = {
    situation: situation.data ?? MOCK_BRIEFING.situation,
    metrics: metrics.data ?? MOCK_BRIEFING.metrics,
    actions: actions.data ?? MOCK_BRIEFING.actions,
    incidents: incidents.data ?? MOCK_INCIDENT_BRIEFS,
  };

  const isLoading =
    situation.isLoading || metrics.isLoading || actions.isLoading || incidents.isLoading;

  const isError =
    situation.isError || metrics.isError || actions.isError || incidents.isError;

  return {
    data,
    isLoading,
    isError,
  };
}