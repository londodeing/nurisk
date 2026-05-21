import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';

export function useCreateVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      sdkClient.post('/volunteers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers', 'list'] });
    },
  });
}
