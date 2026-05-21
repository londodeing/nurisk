import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: ['incidents', 'detail', id],
    queryFn: () => sdk.incidents.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
