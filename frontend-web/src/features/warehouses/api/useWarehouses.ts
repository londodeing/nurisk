import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ['warehouses', params ?? {}],
    queryFn: () => sdk.warehouses.list({
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    }),
    staleTime: 30_000,
  });
}
