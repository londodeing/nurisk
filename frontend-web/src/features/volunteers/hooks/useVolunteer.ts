import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useVolunteer(id: string | undefined) {
  return useQuery({
    queryKey: ['volunteers', 'detail', id],
    queryFn: () => sdk.volunteers.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
