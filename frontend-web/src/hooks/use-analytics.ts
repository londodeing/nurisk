import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@nurisk/sdk';

// ============================================
// Types
// ============================================

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface AnalyticsFilters {
  timeRange: TimeRange;
  region?: string;
  incidentType?: string;
}

export interface KpiData {
  totalIncidents: number;
  activeIncidents: number;
  totalVolunteers: number;
  responseTimeAvg: number;
  assessmentCompletionRate: number;
  shelterCapacity: number;
}

export interface IncidentTrend {
  month: string;
  count: number;
  resolved: number;
}

export interface IncidentTypeData {
  name: string;
  value: number;
  color: string;
}

export interface IncidentRegionData {
  region: string;
  count: number;
}

export interface ResponseTimeData {
  month: string;
  avgResponseTime: number;
}

export interface VolunteerActivityData {
  date: string;
  active: number;
  missions: number;
}

export interface ResourceData {
  resource: string;
  used: number;
  available: number;
}

export interface AnalyticsSummary {
  kpi: KpiData;
  incidentTrend: IncidentTrend[];
  incidentByType: IncidentTypeData[];
  incidentByRegion: IncidentRegionData[];
  responseTime: ResponseTimeData[];
  volunteerActivity: VolunteerActivityData[];
  resourceUtilization: ResourceData[];
}

// ============================================
// API Functions
// ============================================

async function fetchAnalyticsSummary(
  filters: AnalyticsFilters
): Promise<AnalyticsSummary> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);
  if (filters.incidentType) params.append('type', filters.incidentType);

  const response = await client.get<AnalyticsSummary>(`/analytics/summary?${params.toString()}`);
  return response.data as AnalyticsSummary;
}

async function fetchKpiData(filters: AnalyticsFilters): Promise<KpiData> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);

  const response = await client.get<KpiData>(`/analytics/kpi?${params.toString()}`);
  return response.data as KpiData;
}

async function fetchIncidentTrend(
  filters: AnalyticsFilters
): Promise<IncidentTrend[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);

  const response = await client.get<IncidentTrend[]>(`/analytics/incidents/trend?${params.toString()}`);
  return response.data as IncidentTrend[];
}

async function fetchIncidentByType(
  filters: AnalyticsFilters
): Promise<IncidentTypeData[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);

  const response = await client.get<IncidentTypeData[]>(`/analytics/incidents/by-type?${params.toString()}`);
  return response.data as IncidentTypeData[];
}

async function fetchIncidentByRegion(
  filters: AnalyticsFilters
): Promise<IncidentRegionData[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.incidentType) params.append('type', filters.incidentType);

  const response = await client.get<IncidentRegionData[]>(`/analytics/incidents/by-region?${params.toString()}`);
  return response.data as IncidentRegionData[];
}

async function fetchResponseTime(
  filters: AnalyticsFilters
): Promise<ResponseTimeData[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);

  const response = await client.get<ResponseTimeData[]>(`/analytics/response-time?${params.toString()}`);
  return response.data as ResponseTimeData[];
}

async function fetchVolunteerActivity(
  filters: AnalyticsFilters
): Promise<VolunteerActivityData[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);
  if (filters.region) params.append('region', filters.region);

  const response = await client.get<VolunteerActivityData[]>(`/analytics/volunteers/activity?${params.toString()}`);
  return response.data as VolunteerActivityData[];
}

async function fetchResourceUtilization(
  filters: AnalyticsFilters
): Promise<ResourceData[]> {
  const params = new URLSearchParams();
  params.append('timeRange', filters.timeRange);

  const response = await client.get<ResourceData[]>(`/analytics/resources/utilization?${params.toString()}`);
  return response.data as ResourceData[];
}

// ============================================
// Hooks
// ============================================

export function useAnalyticsSummary(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'summary', filters],
    queryFn: () => fetchAnalyticsSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useKpiData(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'kpi', filters],
    queryFn: () => fetchKpiData(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIncidentTrend(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'trend', filters],
    queryFn: () => fetchIncidentTrend(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIncidentByType(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'by-type', filters],
    queryFn: () => fetchIncidentByType(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIncidentByRegion(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'by-region', filters],
    queryFn: () => fetchIncidentByRegion(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResponseTime(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'response-time', filters],
    queryFn: () => fetchResponseTime(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVolunteerActivity(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'volunteers', filters],
    queryFn: () => fetchVolunteerActivity(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceUtilization(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'resources', filters],
    queryFn: () => fetchResourceUtilization(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}