'use client';

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error('Application error:', error);
  }, [error]);

  const handleRetry = (): void => {
    reset();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Terjadi Kesalahan
      </h2>

      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        Maaf, terjadi kesalahan pada server. Tim teknis sedang bekerja untuk memperbaiki masalah ini.
      </p>

      {/* Show error details in development only */}
      {typeof window !== 'undefined' && (
        <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-gray-100 p-4 text-left text-xs dark:bg-gray-800">
          <code className="text-red-600 dark:text-red-400">{error.message}</code>
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>

        <Link to="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Jika masalah terus berlanjut,{' '}
        <a
          href="mailto:support@nurisk.id"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          hubungi tim support
        </a>
      </p>
    </div>
  );
}