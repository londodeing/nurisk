import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/services/api';

interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: SendMessagePayload) =>
      sdk.chat.sendMessage(conversationId, { content }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.conversationId] });
    },
  });
}
