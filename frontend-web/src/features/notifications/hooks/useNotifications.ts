import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

interface UseNotificationsFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export function useNotifications(filters?: UseNotificationsFilters) {
  const query = useQuery({
    queryKey: ['notifications', 'list', filters ?? {}],
    queryFn: () => sdk.notifications.list({
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    }),
    refetchInterval: 30_000,
  });

  const unreadCount = query.data?.items?.filter((n: any) => !n.readAt).length ?? 0;

  return { ...query, unreadCount };
}
