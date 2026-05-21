import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function useNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  unreadOnly?: boolean;
}) {
  const query = useQuery({
    queryKey: ['notifications', params ?? {}],
    queryFn: () => sdk.notifications.list({
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    }),
    refetchInterval: 15_000,
  });

  const unreadCount = (query.data as any)?.items?.filter((n: any) => !n.readAt).length ?? 0;

  return { ...query, unreadCount };
}
