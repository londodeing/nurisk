import React, { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { sdk } from '@/services/api';
import { useAuthStore } from '@/stores/use-auth-store';

// ============================================
// Canonical Types (from shared-types)
// ============================================

import type {
  Message,
  Conversation,
} from '@nurisk/shared-types/chat';

// Re-export canonical types for convenience
export type { Message, Conversation };

// ============================================
// UI State Types (local only)
// ============================================

/**
 * TypingUser - UI state for typing animation
 * timestamp is local state, not transported
 */
export interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: number;
}

/**
 * ChatMessagePayload - API request format
 */
export interface ChatMessagePayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  type?: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName: string;
}

// ============================================
// API Response Mappers
// ============================================

// Map snake_case API response to canonical camelCase
// Note: API returns snake_case, map to canonical shared-types format
const mapMessage = (m: any): Message => ({
  id: m.id,
  conversationId: m.conversation_id,
  senderId: m.sender_id,
  senderName: m.sender_name,
  senderAvatar: m.sender_avatar,
  message: m.message,
  type: m.type,
  mediaUrl: m.attachment_url,
  fileName: m.attachment_name,
  createdAt: m.created_at,
  readBy: m.read_by,
  status: m.status,
});

const mapConversation = (c: any): Conversation => ({
  id: c.id,
  incidentId: c.incident_id,
  incidentTitle: c.incident_title,
  type: c.type,
  lastMessage: c.last_message,
  lastMessageAt: c.last_message_at,
  unreadCount: c.unread_count,
  participants: c.participants,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  createdBy: c.created_by,
  memberCount: c.member_count,
});

// ============================================
// API Functions
// ============================================

async function fetchConversations(userId: string, role: string): Promise<Conversation[]> {
  const response = await sdk.chat.getConversations({ userId, role: role as any });
  return response.items.map(mapConversation);
}

async function fetchMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<{ messages: Message[]; hasMore: boolean }> {
  const response = await sdk.chat.getMessages(conversationId, { page, limit });
  return {
    messages: response.items.map(mapMessage),
    hasMore: response.pagination.page < response.pagination.totalPages,
  };
}

async function sendMessageApi(payload: ChatMessagePayload): Promise<Message> {
  const message = await sdk.chat.sendMessage(payload.conversationId, {
    type: payload.type as any || 'TEXT',
    message: payload.message,
    mediaUrl: payload.attachmentUrl,
  });
  return mapMessage(message);
}

async function markAsRead(conversationId: string, messageId: string): Promise<void> {
  await sdk.chat.markAsRead(conversationId, messageId);
}

async function searchMessages(
  query: string,
  conversationId?: string
): Promise<Message[]> {
  // GOVERNANCE: Use SDK instead of raw axios
  const response = await sdk.chat.searchMessages(query, conversationId);
  return response.map(mapMessage);
}

// GOVERNANCE: Use SDK instead of raw axios
async function uploadAttachment(file: File): Promise<{ url: string; name: string }> {
  return sdk.chat.uploadAttachment(file);
}

// ============================================
// Socket Connection
// ============================================

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || '/', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ============================================
// Hooks
// ============================================

export function useConversations(userId: string, role: string) {
  return useQuery({
    queryKey: ['conversations', userId, role],
    queryFn: () => fetchConversations(userId, role),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useMessages(conversationId: string, page = 1) {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => fetchMessages(conversationId, page),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const socket = getSocket();

  return useMutation({
    mutationFn: (payload: ChatMessagePayload) => sendMessageApi(payload),
    onSuccess: (message) => {
      // Add to local cache
      queryClient.setQueryData(
        ['messages', message.conversationId],
        (old: { messages: Message[]; hasMore: boolean } | undefined) => {
          if (!old) return { messages: [message], hasMore: false };
          return { messages: [...old.messages, message], hasMore: old.hasMore };
        }
      );

      // Emit to socket for real-time
      if (socket?.connected) {
        socket.emit('chat:message', message);
      }
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      markAsRead(conversationId, userId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

export function useSearchMessages() {
  return useMutation({
    mutationFn: ({ query, conversationId }: { query: string; conversationId?: string }) =>
      searchMessages(query, conversationId),
  });
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file),
  });
}

// ============================================
// Socket Event Hooks
// ============================================

export function useChatSocket(conversationId: string | null) {
  const socket = getSocket();
  const queryClient = useQueryClient();
  const { user: _user } = useAuthStore();

  // Join room on mount
  useEffect(() => {
    if (socket?.connected && conversationId) {
      socket.emit('join_room', conversationId);
      return () => {
        socket.emit('leave_room', conversationId);
      };
    }
  }, [socket, conversationId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(
          ['messages', conversationId],
          (old: { messages: Message[] } | undefined) => {
            if (!old) return { messages: [message], hasMore: false };
            // Avoid duplicates
            if (old.messages.some((m) => m.id === message.id)) return old;
            return { messages: [...old.messages, message], hasMore: old.hasMore };
          }
        );
      }
    };

    socket.on('chat:message', handleNewMessage);
    return () => {
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, conversationId, queryClient]);
}

// ============================================
// Typing Indicator Hooks
// ============================================

export function useTypingIndicator(conversationId: string | null) {
  const socket = getSocket();
  const { user } = useAuthStore();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTypingStart = useCallback(() => {
    if (socket?.connected && conversationId && user) {
      socket.emit('typing:start', {
        conversationId,
        userId: user.id,
        userName: user.name,
      });
    }
  }, [socket, conversationId, user]);

  const sendTypingStop = useCallback(() => {
    if (socket?.connected && conversationId && user) {
      socket.emit('typing:stop', {
        conversationId,
        userId: user.id,
        userName: user.name,
      });
    }
  }, [socket, conversationId, user]);

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start
    sendTypingStart();

    // Auto-stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop();
    }, 3000);
  }, [sendTypingStart, sendTypingStop]);

  return { handleTyping, sendTypingStart, sendTypingStop };
}

export function useTypingUsers(conversationId: string | null) {
  const socket = getSocket();
  const { user } = useAuthStore();
  const [typingUsers, setTypingUsers] = React.useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleTypingStart = (data: TypingPayload) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev;
          return [...prev, { 
            userId: data.userId, 
            userName: data.userName, 
            conversationId: data.conversationId, 
            timestamp: Date.now() 
          }];
        });
      }
    };

    const handleTypingStop = (data: TypingPayload) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, conversationId, user]);

  return typingUsers;
}

// ============================================
// Broadcast Hook (Admin only)
// ============================================

export function useBroadcast() {
  const socket = getSocket();

  const sendBroadcast = useCallback(
    async (message: string, senderId: string, senderName: string) => {
      const payload: ChatMessagePayload = {
        conversationId: 'broadcast',
        senderId,
        senderName,
        message,
        type: 'text',
      };

      // Send via API
      await sendMessageApi(payload);

      // Emit via socket
      if (socket?.connected) {
        socket.emit('broadcast:message', payload);
      }
    },
    [socket]
  );

  return { sendBroadcast };
}