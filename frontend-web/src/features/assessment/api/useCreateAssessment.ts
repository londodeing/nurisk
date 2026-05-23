import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';

export default function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => sdkClient.post('/assessments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
