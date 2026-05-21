import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, Search, Phone, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Message, Conversation, TypingUser } from '@/hooks/use-chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  typingUsers: TypingUser[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSend: (message: string, attachment?: { url: string; name: string; type: 'image' | 'file' }) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export function ChatArea({
  conversation,
  messages,
  typingUsers,
  currentUserId,
  isLoading,
  hasMore = false,
  onLoadMore,
  onSend,
  onTyping,
  onStopTyping,
  onBack,
  isMobile = false,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Load more on scroll to top
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isLoading) return;
    if (containerRef.current.scrollTop === 0) {
      onLoadMore?.();
    }
  };

  // Search messages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = messages
      .map((m, i) => m.message.toLowerCase().includes(searchQuery.toLowerCase()) ? i : -1)
      .filter((i) => i >= 0);
    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [searchQuery, messages]);

  const goToNextSearch = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    // Scroll to message
    const messageEl = document.getElementById(`message-${searchResults[nextIndex]}`);
    messageEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToPrevSearch = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    const messageEl = document.getElementById(`message-${searchResults[prevIndex]}`);
    messageEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Users className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">Pilih percakapan</p>
        <p className="text-sm">Pilih ruangan chat dari daftar</p>
      </div>
    );
  }

  const title = conversation.incidentTitle || `Incident #${conversation.incidentId}`;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onBack} className="p-1 -ml-1">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div>
            <h2 className="font-semibold text-slate-700">{title}</h2>
            <p className="text-xs text-slate-500">
              {conversation.participants?.length || 0} participant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showSearch ? 'bg-nu-green/10 text-nu-green' : 'hover:bg-slate-100'
            )}
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <Phone className="w-5 h-5 text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50"
            />
            {searchResults.length > 0 && (
              <>
                <span className="text-xs text-slate-500">
                  {currentSearchIndex + 1}/{searchResults.length}
                </span>
                <button
                  onClick={goToPrevSearch}
                  className="p-1.5 hover:bg-slate-200 rounded"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextSearch}
                  className="p-1.5 hover:bg-slate-200 rounded"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {/* Load More Spinner */}
        {isLoading && hasMore && (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-2 border-nu-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          const showSender = !prevMessage || prevMessage.senderId !== message.senderId;
          const showTimestamp = !nextMessage || nextMessage.senderId !== message.senderId ||
            new Date(message.createdAt).getTime() - new Date(prevMessage?.createdAt || 0).getTime() > 5 * 60 * 1000;

          return (
            <div key={message.id} id={`message-${index}`}>
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showSender={showSender}
                showTimestamp={showTimestamp}
                isFirst={showSender}
                isLast={showTimestamp}
              />
            </div>
          );
        })}

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} currentUserId={currentUserId} />

        {/* End Ref */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={isLoading}
      />
    </div>
  );
}

export default ChatArea;