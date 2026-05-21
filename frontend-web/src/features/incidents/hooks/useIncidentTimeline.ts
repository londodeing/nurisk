import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useIncidentTimeline(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['incidents', 'timeline', incidentId],
    queryFn: () => sdk.incidents.getTimeline(incidentId!),
    enabled: !!incidentId,
    staleTime: 60_000,
  });
}