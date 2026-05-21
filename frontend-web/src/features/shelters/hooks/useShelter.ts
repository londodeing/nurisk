import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useShelter(id: string | undefined) {
  return useQuery({
    queryKey: ['shelters', 'detail', id],
    queryFn: () => sdk.shelters.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
