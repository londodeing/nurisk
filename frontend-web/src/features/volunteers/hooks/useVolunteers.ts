import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { VolunteerFilter, VolunteerStatus } from '@nurisk/shared-types';

interface UseVolunteersFilters {
  page?: number;
  limit?: number;
  status?: VolunteerStatus;
  province?: string;
  search?: string;
}

export function useVolunteers(filters?: UseVolunteersFilters) {
  const queryFilters: VolunteerFilter = {
    status: filters?.status,
    province: filters?.province,
    search: filters?.search,
  };

  return useQuery({
    queryKey: ['volunteers', 'list', filters ?? {}],
    queryFn: () => sdk.volunteers.list({
      ...queryFilters,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    }),
    staleTime: 30_000,
  });
}
