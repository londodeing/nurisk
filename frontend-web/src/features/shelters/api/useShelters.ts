import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useShelters(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['shelters', params ?? {}],
    queryFn: () => sdk.shelters.list({
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search,
      status: params?.status,
    }),
    staleTime: 30_000,
  });
}
