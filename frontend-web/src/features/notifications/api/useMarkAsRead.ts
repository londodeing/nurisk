import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sdk.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
