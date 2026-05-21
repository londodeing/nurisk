import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { IncidentFilter, IncidentStatus } from '@nurisk/shared-types/incident';

interface UseIncidentsFilters {
  page?: number;
  limit?: number;
  status?: IncidentStatus;
  severity?: string;
  search?: string;
}

export function useIncidents(filters?: UseIncidentsFilters) {
  const queryFilters: IncidentFilter = {
    status: filters?.status,
    search: filters?.search,
  };

  return useQuery({
    queryKey: ['incidents', 'list', filters ?? {}],
    queryFn: () => sdk.incidents.list({
      ...queryFilters,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    }),
    staleTime: 30_000,
  });
}
