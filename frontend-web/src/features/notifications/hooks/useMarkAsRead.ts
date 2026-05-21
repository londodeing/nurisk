import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string | string[]) => {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      return Promise.all(ids.map((id) => sdk.notifications.markAsRead(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
}
