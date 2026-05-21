import { useQuery } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';

export default function useAssessment(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['assessment', incidentId],
    queryFn: () => sdkClient.get(`/assessments/incident/${incidentId}`),
    enabled: !!incidentId,
    staleTime: 30_000,
  });
}
