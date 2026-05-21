/**
 * CommunicationHub Component
 * Communication panel for Command Center
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageSquare, Radio, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/use-auth-store';
import type { MessageType } from '@nurisk/shared-types/chat';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type: MessageType;
}

export function CommunicationHub() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts' | 'broadcast'>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Tim Alpha bergerak ke lokasi banjir',
        sender: 'Komando Pusat',
        timestamp: new Date().toISOString(),
        type: 'message',
      },
      {
        id: '2',
        text: 'Evakuasi warga selesai',
        sender: 'Tim Bravo',
        timestamp: new Date().toISOString(),
        type: 'message',
      },
    ]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      sender: user?.name || 'Commander',
      timestamp: new Date().toISOString(),
      type: activeTab === 'broadcast' ? 'broadcast' : 'message',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
            activeTab === 'chat'
              ? 'text-nu-green border-b-2 border-nu-green'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
            activeTab === 'alerts'
              ? 'text-nu-green border-b-2 border-nu-green'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Bell className="h-4 w-4" />
          Alerts
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
            activeTab === 'broadcast'
              ? 'text-nu-green border-b-2 border-nu-green'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Radio className="h-4 w-4" />
          Broadcast
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'p-3 rounded-lg',
              msg.type === 'broadcast'
                ? 'bg-red-900/50 border border-red-700'
                : 'bg-slate-700'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300">{msg.sender}</span>
              <span className="text-xs text-slate-500">
                {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTab === 'broadcast'
                ? 'Ketik pesan broadcast...'
                : 'Ketik pesan...'
            }
            className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-nu-green"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              'p-2 rounded-lg transition-colors',
              message.trim()
                ? 'bg-nu-green hover:bg-nu-green/90'
                : 'bg-slate-700 text-slate-500'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Online Users */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="h-4 w-4" />
          <span>12 pengguna online</span>
        </div>
      </div>
    </div>
  );
}

export default CommunicationHub;