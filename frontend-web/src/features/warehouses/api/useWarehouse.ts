import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: () => sdk.warehouses.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
