/**
 * SyncStatus - Shows queue count and sync status
 */

import { useEffect, useState } from 'react';
import { useOfflineStatus } from '@/hooks/use-offline-status';
import * as offline from '@/lib/offline';

interface SyncStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncStatus({ className = '', showLabel = true }: SyncStatusProps) {
  const { isOnline, isOffline } = useOfflineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize and set callback
    const init = async () => {
      await offline.initOfflineService();
      
      offline.onSync((count) => {
        setQueueCount(count);
      });
    };
    
    init();

    // Load initial count
    offline.getPendingCount().then(setQueueCount);
  }, []);

  // Manual sync
  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await offline.syncQueue();
      const count = await offline.getPendingCount();
      setQueueCount(count);
    } finally {
      setIsSyncing(false);
    }
  };

  if (queueCount === 0 && isOnline) return null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full
        ${isOffline 
          ? 'bg-amber-100 text-amber-800' 
          : isSyncing 
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }
        ${className}
      `}
    >
      {/* Sync icon */}
      <button
        onClick={handleSync}
        disabled={!isOnline || isSyncing}
        className={`
          w-4 h-4 transition-transform
          ${isSyncing ? 'animate-spin' : 'hover:rotate-180'}
          ${!isOnline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>

      {/* Count badge */}
      {queueCount > 0 && (
        <span className="text-xs font-medium">
          {showLabel && (
            <span className="mr-1">
              {isSyncing ? 'Menyinkronkan...' : `${queueCount} tertunda`}
            </span>
          )}
          {!showLabel && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
              {queueCount > 9 ? '9+' : queueCount}
            </span>
          )}
        </span>
      )}

      {/* Online indicator */}
      {isOnline && queueCount === 0 && !isSyncing && (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          {showLabel && 'Tersinkron'}
        </span>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          {showLabel && 'Offline'}
        </span>
      )}
    </div>
  );
}

export default SyncStatus;