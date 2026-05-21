'use client';

import { useState } from 'react';
import { Radio, AlertTriangle, Send, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CommunicationChannel,
  BroadcastMessage,
} from '@/services/awarenessService';

interface CommunicationPanelProps {
  channels: CommunicationChannel[];
  broadcasts: BroadcastMessage[];
  className?: string;
  onSendBroadcast?: (
    channelId: string,
    message: string,
    priority: 'normal' | 'urgent' | 'emergency'
  ) => void;
}

export function CommunicationPanel({
  channels,
  broadcasts,
  className,
  onSendBroadcast,
}: CommunicationPanelProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    channels[0]?.id ?? null
  );
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<
    'normal' | 'urgent' | 'emergency'
  >('normal');

  const handleSend = () => {
    if (!selectedChannel || !message.trim()) return;
    onSendBroadcast?.(selectedChannel, message.trim(), priority);
    setMessage('');
  };

  // Filter broadcasts for selected channel
  const channelBroadcasts = broadcasts.filter(
    (b) => b.channelId === selectedChannel
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Channel Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              selectedChannel === channel.id
                ? channel.type === 'emergency'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-200'
            )}
          >
            {channel.type === 'emergency' ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : channel.type === 'broadcast' ? (
              <Radio className="w-4 h-4 text-blue-500" />
            ) : (
              <Users className="w-4 h-4 text-green-500" />
            )}
            {channel.name}
            {!channel.active && (
              <span className="w-2 h-2 rounded-full bg-slate-300" />
            )}
          </button>
        ))}
      </div>

      {/* Broadcast List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Pesan Terkini</h3>
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {channelBroadcasts.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada pesan</p>
            </div>
          ) : (
            channelBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className={cn(
                  'p-3 border-b border-slate-50 last:border-0',
                  broadcast.priority === 'emergency' && 'bg-red-50',
                  broadcast.priority === 'urgent' && 'bg-amber-50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{broadcast.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {broadcast.sender}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(broadcast.timestamp)}
                      </span>
                    </div>
                  </div>
                  {broadcast.priority !== 'normal' && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        broadcast.priority === 'emergency'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      )}
                    >
                      {broadcast.priority === 'emergency' ? 'Darurat' : 'Mendesak'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Message */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-3">
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as 'normal' | 'urgent' | 'emergency')
            }
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Mendesak</option>
            <option value="emergency">Darurat</option>
          </select>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Baru';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export default CommunicationPanel;