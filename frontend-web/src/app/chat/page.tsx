import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useTypingIndicator,
  useTypingUsers,
  useChatSocket,
  useMarkAsRead,
  useBroadcast,
  connectSocket,
  disconnectSocket,
  Conversation,
} from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatArea } from '@/components/chat/ChatArea';
import { BroadcastAlert } from '@/components/chat/BroadcastAlert';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Connect socket
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations(
    user?.id || '',
    user?.role || ''
  );

  // Fetch messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
  } = useMessages(activeConversation?.id || '', 1);

  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Mark as read mutation
  const markAsReadMutation = useMarkAsRead();

  // Broadcast mutation
  const { sendBroadcast } = useBroadcast();

  // Socket events
  useChatSocket(activeConversation?.id || null);

  // Typing indicator
  const { sendTypingStart, sendTypingStop } = useTypingIndicator(
    activeConversation?.id || null
  );

  // Typing users
  const typingUsers = useTypingUsers(activeConversation?.id || null);

  // Mark as read when viewing conversation
  useEffect(() => {
    if (activeConversation?.id && user?.id) {
      markAsReadMutation.mutate({
        conversationId: activeConversation.id,
        userId: user.id,
      });
    }
  }, [activeConversation?.id]);

  // Handle select conversation
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // Handle send message
  const handleSend = useCallback(
    async (
      messageText: string,
      attachment?: { url: string; name: string; type: 'image' | 'file' }
    ) => {
      if (!activeConversation?.id || !user?.id) return;

      await sendMessageMutation.mutateAsync({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        sender_name: user.name,
        message: messageText,
        type: attachment?.type || 'text',
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
      });
    },
    [activeConversation, user, sendMessageMutation]
  );

  // Handle broadcast
  const handleBroadcast = async (message: string) => {
    if (!user?.id) return;
    await sendBroadcast(message, user.id, user.name);
    setShowBroadcast(false);
  };

  // Handle load more (placeholder for future pagination)
  const handleLoadMore = () => {
    // Future: implement pagination
  };

  // Show broadcast button for admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100">
      {/* Sidebar */}
      <div
        className={cn(
          'w-80 flex-shrink-0 border-r border-slate-200 bg-white',
          !showSidebar && 'hidden',
          isMobile && 'absolute inset-0 z-10'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nu-green/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-nu-green" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-700">Pesan</h1>
              <p className="text-xs text-slate-500">
                {conversations.length} percakapan
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          )}
        </div>

        {/* Conversation List */}
        <div className="h-[calc(100vh-12rem)]">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id}
            onSelect={handleSelectConversation}
            isLoading={isLoadingConversations}
            showBroadcast={isAdmin}
            onNewChat={() => {}}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {isMobile && !showSidebar && (
          <div className="flex items-center px-4 py-3 bg-white border-b border-slate-200">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-1 -ml-1 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1">
          <ChatArea
            conversation={activeConversation}
            messages={messages}
            typingUsers={typingUsers}
            currentUserId={user?.id || ''}
            isLoading={isLoadingMessages}
            onLoadMore={handleLoadMore}
            onSend={handleSend}
            onTyping={sendTypingStart}
            onStopTyping={sendTypingStop}
            onBack={() => setShowSidebar(true)}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <BroadcastAlert
          onSend={handleBroadcast}
          onClose={() => setShowBroadcast(false)}
          isLoading={sendMessageMutation.isPending}
        />
      )}
    </div>
  );
}