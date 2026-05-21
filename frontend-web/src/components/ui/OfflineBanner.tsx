import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/use-offline-status';

export default function OfflineBanner() {
  const { isOffline, wasOffline } = useOfflineStatus();
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);

  useEffect(() => {
    if (wasOffline && !isOffline) {
      // Show reconnect prompt when back online
      setShowReconnectPrompt(true);
      setTimeout(() => setShowReconnectPrompt(false), 5000);
    }
  }, [isOffline, wasOffline]);

  if (!isOffline && !showReconnectPrompt) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-white text-sm flex items-center justify-center gap-2 ${
      isOffline ? 'bg-warning-yellow' : 'bg-safe-green'
    }`}>
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Anda sedang offline. Beberapa fitur mungkin terbatas.</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Koneksi kembali. Memuat data terbaru...</span>
        </>
      )}
    </div>
  );
}