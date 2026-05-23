import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';
import type { UpdateIncidentRequest } from '@nurisk/shared-types';

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentRequest }) => 
      sdk.incidents.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incidents', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'map'] });
    },
  });
}