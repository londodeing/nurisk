import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { CreateIncidentRequest } from '@nurisk/shared-types';

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncidentRequest) => sdk.incidents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'map'] });
    },
  });
}
