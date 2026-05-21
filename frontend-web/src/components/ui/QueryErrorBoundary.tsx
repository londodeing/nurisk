'use client';

/**
 * GlobalQueryErrorBoundary
 * Catches query errors and surfaces them to UI
 * 
 * IMPORTANT: This is for observability, NOT for hiding errors.
 * All errors should be visible in console + UI.
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './button';
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Component name for debugging */
  componentName?: string;
}

interface QueryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalQueryErrorBoundary extends Component<QueryErrorBoundaryProps, QueryErrorBoundaryState> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<QueryErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for observability
    console.error('[QUERY ERROR]', error, errorInfo);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <QueryErrorFallback
          error={this.state.error}
          componentName={this.props.componentName}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * QueryErrorFallback - Explicit error UI
 * Shows error message, NOT blank component
 */
interface QueryErrorFallbackProps {
  error: Error | null;
  componentName?: string;
  onRetry?: () => void;
}

export function QueryErrorFallback({
  error,
  componentName = 'Unknown',
  onRetry,
}: QueryErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Gagal memuat data
      </h3>

      <p className="mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
        Terjadi kesalahan saat memuat {componentName}. Silakan coba lagi.
      </p>

      {/* Show error details in development */}
      {process.env.NODE_ENV === 'development' && error && (
        <pre className="mb-4 max-w-lg overflow-auto rounded-lg bg-gray-100 p-3 text-left text-xs dark:bg-gray-800">
          <code className="text-red-600 dark:text-red-400">{error.message}</code>
        </pre>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Jika masalah berlanjut, hubungi administrator.
      </p>
    </div>
  );
}

/**
 * LoadingState - Explicit loading UI
 * Shows loading indicator, NOT blank component
 */
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Memuat data...',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
}

/**
 * EmptyState - Explicit empty UI
 * Shows empty message, NOT blank component
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({
  title = 'Tidak ada data',
  message = 'Data tidak tersedia.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
        <HelpCircle className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <p className="mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * QueryState - Combined loading/error/empty states
 * Use this for consistent query UI
 */
interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  loadingMessage?: string;
}

export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'Tidak ada data tersedia.',
  children,
  loadingMessage = 'Memuat data...',
}: QueryStateProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return <QueryErrorFallback error={error} />;
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}