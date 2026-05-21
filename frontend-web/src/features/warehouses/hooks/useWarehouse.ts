import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: ['warehouses', 'detail', id],
    queryFn: () => sdk.warehouses.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
