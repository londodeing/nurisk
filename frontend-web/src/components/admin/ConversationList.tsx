import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/stores/use-auth-store';
import type { Message, Conversation } from '@nurisk/shared-types/chat';

export default function ConversationList() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data;
    },
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', id],
    queryFn: async () => {
      const res = await api.get(`/messages/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!id) return;
    
    const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/messages/${id}`);
    
    socket.onmessage = (_event) => {
      // Add to messages list
    };
    
    return () => socket.close();
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const activeConversation = conversations.find(c => c.id === id);

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <div className="col-span-1 bg-white rounded-lg border overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map(conv => (
            <Link
              key={conv.id}
              to={`/admin/messages/${conv.id}`}
              className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${
                id === conv.id ? 'bg-nu-green/10 border-l-2 border-l-nu-green' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {conv.participants?.[0]?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm truncate">{conv.participants?.[0]?.name}</p>
                    <span className="text-xs text-slate-400">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="col-span-2 bg-white rounded-lg border flex flex-col">
        {id && activeConversation ? (
          <>
            {/* Header */}
            <div className="p-3 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {activeConversation.participants?.[0]?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{activeConversation.participants?.[0]?.name}</p>
                  <p className="text-xs text-slate-500">{activeConversation.participants?.[0]?.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-nu-green text-white'
                        : 'bg-slate-100'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    {msg.mediaUrl && (
                      <div className="mt-2">
                        <a
                          href={msg.mediaUrl}
                          className="flex items-center gap-1 text-xs underline"
                          target="_blank"
                        >
                          <Paperclip className="w-3 h-3" />
                          {msg.fileName || 'Attachment'}
                        </a>
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      msg.senderId === user?.id ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <MessageInput conversationId={id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

function MessageInput({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    await api.post(`/messages/${conversationId}`, { content: message });
    setMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    
    await api.post(`/messages/${conversationId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));
      await api.post(`/messages/${conversationId}/attachments`, formData);
    }
  };

  return (
    <div 
      className="flex gap-2"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-slate-100 rounded-lg"
      >
        <Paperclip className="w-5 h-5 text-slate-400" />
      </button>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
        className="flex-1"
      />
      <button
        onClick={sendMessage}
        disabled={!message.trim()}
        className="p-2 bg-nu-green text-white rounded-lg hover:bg-nu-green/90"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}