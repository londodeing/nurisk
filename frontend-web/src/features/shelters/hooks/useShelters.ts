import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

interface UseSheltersFilters {
  page?: number;
  limit?: number;
  status?: string;
  capacityMin?: number;
  location?: string;
}

export function useShelters(filters?: UseSheltersFilters) {
  return useQuery({
    queryKey: ['shelters', 'list', filters ?? {}],
    queryFn: () => sdk.shelters.list({
      ...filters,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    }),
    staleTime: 30_000,
  });
}
