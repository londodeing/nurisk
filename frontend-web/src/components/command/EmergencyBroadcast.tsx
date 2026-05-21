/**
 * EmergencyBroadcast Component
 * Emergency broadcast form for Command Center
 */

import { useState } from 'react';
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface EmergencyBroadcastProps {
  onClose: () => void;
}

type BroadcastPriority = 'low' | 'medium' | 'high' | 'critical';

type BroadcastChannel = 'all' | 'volunteers' | 'shelters' | 'public';

export function EmergencyBroadcast({ onClose }: EmergencyBroadcastProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<BroadcastPriority>('medium');
  const [channel, setChannel] = useState<BroadcastChannel>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/broadcast', {
        message,
        priority,
        channel,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions: { value: BroadcastPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500' },
    { value: 'high', label: 'Tinggi', color: 'bg-orange-500' },
    { value: 'critical', label: 'Kritis', color: 'bg-red-500' },
  ];

  const channelOptions: { value: BroadcastChannel; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'volunteers', label: 'Relawan' },
    { value: 'shelters', label: 'Pengungsian' },
    { value: 'public', label: 'Publik' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Emergency Broadcast</h2>
              <p className="text-xs text-slate-400">Kirim pesan darurat ke semua channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-center">
              <p className="text-green-400 font-medium">Broadcast berhasil dikirim!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Prioritas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    priority === opt.value
                      ? `${opt.color} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              {channelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setChannel(opt.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    channel === opt.value
                      ? 'bg-nu-green text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Pesan
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan darurat..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-nu-green resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-colors',
                message.trim() && !isLoading
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Broadcast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyBroadcast;