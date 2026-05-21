import { useState } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Radio,
} from 'lucide-react';
import { Conversation } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
  isLoading?: boolean;
  showBroadcast?: boolean;
  onNewChat?: () => void;
}

const CONVERSATION_ICONS = {
  incident: MessageSquare,
  broadcast: Radio,
  direct: Users,
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
  showBroadcast = false,
  onNewChat,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const title = conv.incidentTitle || `Incident #${conv.incidentId}`;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const broadcastConv = conversations.find((c) => c.type === 'broadcast');
  const incidentConvs = conversations.filter((c) => c.type === 'incident');
  const directConvs = conversations.filter((c) => c.type === 'direct');

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari percakapan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {/* Broadcast Channel (Admin only) */}
        {showBroadcast && broadcastConv && (
          <div className="p-2">
            <button
              onClick={() => onSelect(broadcastConv)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                activeId === broadcastConv.id
                  ? 'bg-nu-green/10 text-nu-green'
                  : 'hover:bg-slate-50'
              )}
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate">Broadcast</p>
                <p className="text-xs text-slate-500 truncate">Semua volunteer</p>
              </div>
              {broadcastConv.unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
                  {broadcastConv.unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Incident Conversations */}
        {incidentConvs.length > 0 && (
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">
              Incident
            </p>
            {incidentConvs.map((conv) => {
              const Icon = CONVERSATION_ICONS.incident;
              const title = conv.incidentTitle || `Incident #${conv.incidentId}`;
              const isActive = activeId === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-nu-green/10 text-nu-green'
                      : 'hover:bg-slate-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isActive ? 'bg-nu-green/20' : 'bg-slate-100'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isActive ? 'text-nu-green' : 'text-slate-500')} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {conv.lastMessage || 'Belum ada pesan'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Direct Messages */}
        {directConvs.length > 0 && (
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">
              Direct Message
            </p>
            {directConvs.map((conv) => {
              const Icon = CONVERSATION_ICONS.direct;
              const isActive = activeId === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-nu-green/10 text-nu-green'
                      : 'hover:bg-slate-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isActive ? 'bg-nu-green/20' : 'bg-slate-100'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isActive ? 'text-nu-green' : 'text-slate-500')} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm truncate">
                      {conv.participants?.[0]?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {conv.lastMessage || 'Belum ada pesan'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p className="text-sm">Tidak ada percakapan</p>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      {onNewChat && (
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-nu-green text-white rounded-lg hover:bg-nu-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Percakapan Baru</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ConversationList;