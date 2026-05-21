'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = (): void => {
      setIsOnline(true);
      // Auto-refresh when back online
      window.location.reload();
    };

    const handleOffline = (): void => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  const handleRefresh = (): void => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <WifiOff className="h-12 w-12 text-gray-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Anda Sedang Offline
      </h2>

      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
      </p>

      <div className="mb-8 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Fitur yang masih bisa diakses:</p>
            <ul className="mt-1 list-inside list-disc">
              <li>Dashboard publik</li>
              <li>Peta offline (jika sudah diunduh)</li>
              <li>Laporan insiden tersimpan lokal</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRefresh} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Sambung Kembali
        </Button>

        <Link to="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}