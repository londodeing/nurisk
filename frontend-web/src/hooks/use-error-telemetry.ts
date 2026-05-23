/**
 * Error Telemetry Hook
 * PHASE-12: Capture production frontend failures
 */
import { useEffect, useRef, useCallback } from 'react';

export interface ErrorTelemetry {
  error: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  route?: string;
}

export interface ErrorTelemetryConfig {
  endpoint?: string;
  onError?: (error: ErrorTelemetry) => void;
  enabled?: boolean;
}

/**
 * Generate or retrieve session ID
 */
function getSessionId(): string {
  const key = 'nurisk_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Capture error details
 */
function captureError(error: Error, errorInfo?: React.ErrorInfo): ErrorTelemetry {
  return {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    route: window.location.pathname,
  };
}

/**
 * Send error to backend
 */
async function sendErrorToBackend(error: ErrorTelemetry, endpoint?: string): Promise<void> {
  try {
    const url = endpoint || '/api/telemetry/errors';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch {
    // Silently fail - don't create infinite error loops
  }
}

/**
 * React error boundary hook
 */
export function useErrorTelemetry(config: ErrorTelemetryConfig = {}): {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
} {
  const { endpoint, onError, enabled = true } = config;
  const errorRef = useRef<Error | null>(null);
  const errorInfoRef = useRef<React.ErrorInfo | null>(null);

  const handleError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      if (!enabled) return;

      const telemetry = captureError(error, errorInfo);
      errorRef.current = error;
      errorInfoRef.current = errorInfo || null;

      // Send to backend
      sendErrorToBackend(telemetry, endpoint);

      // Call custom handler
      onError?.(telemetry);
    },
    [endpoint, onError, enabled]
  );

  const resetError = useCallback(() => {
    errorRef.current = null;
    errorInfoRef.current = null;
  }, []);

  return {
    error: errorRef.current,
    errorInfo: errorInfoRef.current,
    resetError,
  };
}

/**
 * Global error handler for uncaught errors
 */
let globalErrorHandler: ((event: ErrorEvent) => void) | null = null;
let globalPromiseRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

export function initGlobalErrorTelemetry(config: ErrorTelemetryConfig = {}): void {
  const { endpoint, enabled = true } = config;
  if (!enabled) return;

  // Uncaught errors
  globalErrorHandler = (event: ErrorEvent) => {
    const error: ErrorTelemetry = {
      error: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      route: window.location.pathname,
    };
    sendErrorToBackend(error, endpoint);
  };

  // Unhandled promise rejections
  globalPromiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const error: ErrorTelemetry = {
      error: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      route: window.location.pathname,
    };
    sendErrorToBackend(error, endpoint);
  };

  window.addEventListener('error', globalErrorHandler);
  window.addEventListener('unhandledrejection', globalPromiseRejectionHandler);
}

export function cleanupGlobalErrorTelemetry(): void {
  if (globalErrorHandler) {
    window.removeEventListener('error', globalErrorHandler);
  }
  if (globalPromiseRejectionHandler) {
    window.removeEventListener('unhandledrejection', globalPromiseRejectionHandler);
  }
}