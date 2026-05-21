import { useState } from 'react';
import { Radio, Send, X, AlertTriangle } from 'lucide-react';

interface BroadcastAlertProps {
  onSend: (message: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function BroadcastAlert({ onSend, onClose, isLoading }: BroadcastAlertProps) {
  const [message, setMessage] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    if (!confirmSend) {
      setConfirmSend(true);
      return;
    }
    onSend(message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-500 text-white">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5" />
            <h2 className="font-semibold">Broadcast Alert</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm">
              Pesan ini akan dikirim ke semua volunteer yang aktif
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan broadcast..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
          />
          <p className="text-xs text-slate-400 mt-2 text-right">
            {message.length}/2000 karakter
          </p>
        </div>

        {/* Confirm Dialog */}
        {confirmSend && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              Apakah Anda yakin ingin mengirim broadcast ini?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSend(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!confirmSend && (
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BroadcastAlert;