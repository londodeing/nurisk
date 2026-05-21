import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

interface UseWarehousesFilters {
  page?: number;
  limit?: number;
  type?: string;
  region?: string;
  hasAvailableCapacity?: boolean;
}

export function useWarehouses(filters?: UseWarehousesFilters) {
  return useQuery({
    queryKey: ['warehouses', 'list', filters ?? {}],
    queryFn: () => sdk.warehouses.list({
      ...filters,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    }),
    staleTime: 30_000,
  });
}
