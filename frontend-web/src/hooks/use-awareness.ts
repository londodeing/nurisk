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

// ============================================
// Mock Data (for development)
// ============================================

export const MOCK_TACTICAL_DATA: any = {
  assets: [
    {
      id: 'asset-1',
      name: 'Ambulans 01',
      type: 'vehicle',
      status: 'deployed',
      location: { latitude: -7.2575, longitude: 112.7521 },
      fuelLevel: 75,
      lastUpdate: new Date().toISOString(),
      assignedTo: 'incident-1',
    },
    {
      id: 'asset-2',
      name: 'Truck 01',
      type: 'vehicle',
      status: 'available',
      location: { latitude: -7.2755, longitude: 112.7421 },
      fuelLevel: 90,
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'asset-3',
      name: 'Generator 01',
      type: 'equipment',
      status: 'deployed',
      location: { latitude: -7.2655, longitude: 112.7621 },
      batteryLevel: 85,
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'asset-4',
      name: 'Pompa 01',
      type: 'equipment',
      status: 'available',
      location: { latitude: -7.2555, longitude: 112.7321 },
      batteryLevel: 100,
      lastUpdate: new Date().toISOString(),
    },
  ],
  incidents: [
    {
      id: 'incident-1',
      title: 'Banjir Surabaya Utara',
      description: 'Genangan air di wilayah Surabaya Utara',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      location: { lat: -7.2575, lng: 112.7521 },
      reportedAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'BANJIR',
    },
    {
      id: 'incident-2',
      title: 'Pohon Tumbang',
      description: 'Pohon tumbang menutup jalan utama',
      severity: 'MEDIUM',
      status: 'ASSIGNED',
      location: { lat: -7.2755, lng: 112.7421 },
      reportedAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'LONGSOR',
    },
  ],
  volunteers: [
    {
      id: 'vol-1',
      name: 'Ahmad Santoso',
      role: 'Team Leader',
      status: 'active',
      location: { latitude: -7.2575, longitude: 112.7521 },
      lastCheckIn: new Date().toISOString(),
      assignedIncident: 'incident-1',
    },
    {
      id: 'vol-2',
      name: 'Budi Prasetyo',
      role: 'Relawan',
      status: 'active',
      location: { latitude: -7.2655, longitude: 112.7621 },
      lastCheckIn: new Date().toISOString(),
      assignedIncident: 'incident-1',
    },
    {
      id: 'vol-3',
      name: 'Siti Rahayu',
      role: 'Relawan',
      status: 'standby',
      location: { latitude: -7.2755, longitude: 112.7421 },
      lastCheckIn: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  evacuationRoutes: [
    {
      id: 'route-1',
      name: 'Rute Evakuasi Utara',
      startPoint: { latitude: -7.2575, longitude: 112.7521 },
      endPoint: { latitude: -7.2005, longitude: 112.7521 },
      waypoints: [
        { latitude: -7.2575, longitude: 112.7521 },
        { latitude: -7.2400, longitude: 112.7521 },
        { latitude: -7.2200, longitude: 112.7521 },
        { latitude: -7.2005, longitude: 112.7521 },
      ],
      status: 'active',
      capacity: 500,
      currentLoad: 120,
    },
  ],
  exclusionZones: [
    {
      id: 'zone-1',
      name: 'Zona Bahaya Banjir',
      area: [
        { latitude: -7.2700, longitude: 112.7600 },
        { latitude: -7.2700, longitude: 112.7400 },
        { latitude: -7.2500, longitude: 112.7400 },
        { latitude: -7.2500, longitude: 112.7600 },
      ],
      type: 'danger',
      severity: 'HIGH',
      activeUntil: new Date(Date.now() + 86400000).toISOString(),
    },
  ],
  channels: [
    {
      id: 'channel-1',
      name: 'Broadcast Umum',
      type: 'broadcast',
      active: true,
      lastMessage: 'Evakuasi dimulai',
      lastMessageTime: new Date().toISOString(),
    },
    {
      id: 'channel-2',
      name: 'Tim Alpha',
      type: 'team',
      active: true,
      lastMessage: 'Siap ditugaskan',
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'channel-3',
      name: 'Darurat',
      type: 'emergency',
      active: true,
    },
  ],
  broadcasts: [
    {
      id: 'broadcast-1',
      channelId: 'channel-1',
      sender: 'Command Center',
      message: 'Evakuasi dimulai untuk wilayah banjir',
      timestamp: new Date().toISOString(),
      priority: 'urgent',
    },
  ],
  timeline: [
    {
      id: 'event-1',
      type: 'incident',
      action: 'Status diubah',
      description: 'Banjir Surabaya Utara: in_progress',
      timestamp: new Date().toISOString(),
      entityId: 'incident-1',
      entityName: 'Banjir Surabaya Utara',
    },
    {
      id: 'event-2',
      type: 'volunteer',
      action: 'Check-in',
      description: 'Ahmad Santoso check-in di lokasi',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      entityId: 'vol-1',
      entityName: 'Ahmad Santoso',
    },
    {
      id: 'event-3',
      type: 'asset',
      action: 'Ditugaskan',
      description: 'Ambulans 01 ditugaskan ke incident',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      entityId: 'asset-1',
      entityName: 'Ambulans 01',
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const MOCK_ASSETS: any[] = MOCK_TACTICAL_DATA.assets;
export const MOCK_INCIDENTS: any[] = MOCK_TACTICAL_DATA.incidents;
export const MOCK_VOLUNTEERS: any[] = MOCK_TACTICAL_DATA.volunteers;
export const MOCK_ROUTES: any[] = MOCK_TACTICAL_DATA.evacuationRoutes;
export const MOCK_ZONES: any[] = MOCK_TACTICAL_DATA.exclusionZones;
export const MOCK_CHANNELS: any[] = MOCK_TACTICAL_DATA.channels;
export const MOCK_BROADCASTS: any[] = MOCK_TACTICAL_DATA.broadcasts;
export const MOCK_TIMELINE: any[] = MOCK_TACTICAL_DATA.timeline;