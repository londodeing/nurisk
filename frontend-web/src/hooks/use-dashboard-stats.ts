import { useQuery } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';

export interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  activeMissions: number;
  responseActions: number;
  volunteers: number;
  volunteersReady: number;
  shelters: number;
  shelterCapacity: number;
  resourcesAvailable: number;
  resourcesNeeded: number;
  lastUpdated: string;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response: any = await sdkClient.get('/analytics/summary');
  const data = response?.data?.data ?? response?.data ?? {};

  const incidents = data.incidents ?? {};
  const volunteers = data.volunteers ?? {};
  const assets = data.assets ?? {};

  return {
    totalIncidents: incidents.total_incidents ?? 0,
    activeIncidents: incidents.reported ?? 0,
    activeMissions: incidents.in_action ?? 0,
    responseActions: incidents.assessed ?? 0,
    volunteers: volunteers.total_volunteers ?? 0,
    volunteersReady: volunteers.active ?? 0,
    shelters: 0,
    shelterCapacity: 0,
    resourcesAvailable: assets.total_items ?? 0,
    resourcesNeeded: assets.total_types ?? 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}
