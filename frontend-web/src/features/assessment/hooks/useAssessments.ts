import { useQuery } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';

interface UseAssessmentsFilters {
  page?: number;
  limit?: number;
  status?: string;
  region?: string;
}

export function useAssessments(filters?: UseAssessmentsFilters) {
  return useQuery({
    queryKey: ['assessments', 'list', filters ?? {}],
    queryFn: () => sdkClient.get('/assessments', {
      params: {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        status: filters?.status,
        region: filters?.region,
      },
    }),
    staleTime: 30_000,
  });
}
