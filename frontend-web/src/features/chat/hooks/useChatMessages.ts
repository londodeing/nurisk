import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export function useChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => sdk.chat.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}
