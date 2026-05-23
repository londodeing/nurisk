/**
 * useAwareness Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery } from '@tanstack/react-query';
import { awarenessApi } from '@nurisk/sdk';
import type {
  TacticalData,
  EvacuationRoute,
  ExclusionZone,
} from '@nurisk/shared-types/awareness';

// ============================================
// Hooks
// ============================================

const REFRESH_INTERVAL = 10 * 1000; // 10 seconds

/**
 * Get tactical data
 * SDK METHOD MISSING: getTacticalData - using getTactical as fallback
 */
export function useTacticalData() {
  return useQuery<TacticalData>({
    queryKey: ['awareness', 'tactical'],
    queryFn: () => awarenessApi.getTactical('default'),
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get assets
 * SDK METHOD MISSING: getAssets - using getTactical as fallback
 */
export function useAssets() {
  return useQuery<any[]>({
    queryKey: ['awareness', 'assets'],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.assets) {
        throw new Error('[awareness/assets] Invalid response: missing assets field');
      }
      return tactical.assets;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get incidents
 * SDK METHOD MISSING: getIncidents - using getTactical as fallback
 */
export function useIncidents() {
  return useQuery<any[]>({
    queryKey: ['awareness', 'incidents'],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.incidents) {
        throw new Error('[awareness/incidents] Invalid response: missing incidents field');
      }
      return tactical.incidents;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get volunteers
 * SDK METHOD MISSING: getVolunteers - using getTactical as fallback
 */
export function useVolunteers() {
  return useQuery<any[]>({
    queryKey: ['awareness', 'volunteers'],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.volunteers) {
        throw new Error('[awareness/volunteers] Invalid response: missing volunteers field');
      }
      return tactical.volunteers;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get evacuation routes
 */
export function useEvacuationRoutes() {
  return useQuery<EvacuationRoute[]>({
    queryKey: ['awareness', 'routes'],
    queryFn: () => awarenessApi.getRoutes(),
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get exclusion zones
 */
export function useExclusionZones() {
  return useQuery<ExclusionZone[]>({
    queryKey: ['awareness', 'zones'],
    queryFn: () => awarenessApi.getZones(),
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get communication channels
 * SDK METHOD MISSING: getCommunicationChannels - using getTactical as fallback
 */
export function useCommunicationChannels() {
  return useQuery<any[]>({
    queryKey: ['awareness', 'channels'],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.channels) {
        throw new Error('[awareness/channels] Invalid response: missing channels field');
      }
      return tactical.channels;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get broadcasts
 * SDK METHOD MISSING: getBroadcasts - using getTactical as fallback
 */
export function useBroadcasts() {
  return useQuery<any[]>({
    queryKey: ['awareness', 'broadcasts'],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.broadcasts) {
        throw new Error('[awareness/broadcasts] Invalid response: missing broadcasts field');
      }
      return tactical.broadcasts;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}

/**
 * Get timeline
 * SDK METHOD MISSING: getTimeline - using getTactical as fallback
 */
export function useTimeline(hours: number = 24) {
  return useQuery<any[]>({
    queryKey: ['awareness', 'timeline', hours],
    queryFn: async () => {
      const tactical: any = await awarenessApi.getTactical('default');
      if (!tactical?.timeline) {
        throw new Error('[awareness/timeline] Invalid response: missing timeline field');
      }
      return tactical.timeline;
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  });
}
