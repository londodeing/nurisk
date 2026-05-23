import { useQuery } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';
import type { Incident } from '@nurisk/shared-types/incident';
import type { ListResponse } from '@nurisk/shared-types/api';

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

const DASHBOARD_STALE_TIME = 60000;

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

async function fetchIncidents(limit?: number): Promise<ListResponse<Incident>> {
  const response: any = await sdkClient.get('/incidents', { params: { limit } });
  return {
    items: response.data ?? [],
    pagination: response.pagination ?? {
      page: 1, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false,
    },
  };
}

export function usePublicDashboardData() {
  const incidentsQuery = useQuery({
    queryKey: ['public-dashboard', 'incidents'],
    queryFn: () => fetchIncidents(100),
    staleTime: DASHBOARD_STALE_TIME,
  });

  const statsQuery = useQuery({
    queryKey: ['public-dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: DASHBOARD_STALE_TIME,
  });

  return {
    incidents: incidentsQuery.data?.items ?? [],
    stats: statsQuery.data,
    isLoading: incidentsQuery.isLoading || statsQuery.isLoading,
    isError: incidentsQuery.isError || statsQuery.isError,
    error: incidentsQuery.error || statsQuery.error,
  };
}
