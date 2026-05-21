import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useShelter(id: string | undefined) {
  return useQuery({
    queryKey: ['shelter', id],
    queryFn: () => sdk.shelters.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}
