'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onReset?: () => void;
}

export function ErrorFallback({
  error,
  title = 'Terjadi Kesalahan',
  message = 'Mohon maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
  onReset,
}: ErrorFallbackProps) {
  const handleReset = (): void => {
    onReset?.();
    // Try to reload the page
    window.location.reload();
  };

  const handleGoHome = (): void => {
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>

      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        {message}
      </p>

      {/* Show error details in development only */}
      {typeof window !== 'undefined' && error && (
        <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-gray-100 p-4 text-left text-xs dark:bg-gray-800">
          <code className="text-red-600 dark:text-red-400">{error.message}</code>
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleReset} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>

        <Button onClick={handleGoHome} variant="outline">
          <Home className="mr-2 h-4 w-4" />
          Kembali ke Dashboard
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Still having issues?{' '}
        <a
          href="mailto:support@nurisk.id"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          <Mail className="mr-1 inline h-3 w-3" />
          Contact Support
        </a>
      </p>
    </div>
  );
}