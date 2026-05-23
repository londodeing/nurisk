/**
 * Transport Logger - Frontend API observability
 * Logs all API requests/responses for debugging
 * 
 * IMPORTANT: Development mode only
 */

type LogLevel = 'info' | 'warn' | 'error';

interface TransportLog {
  timestamp: string;
  level: LogLevel;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

const transportLogs: TransportLog[] = [];
const MAX_TRANSPORT_LOGS = 200;

/**
 * Log API request
 */
export function logRequest(method: string, url: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const log: TransportLog = {
    timestamp: new Date().toISOString(),
    level: 'info',
    method,
    url,
  };
  
  if (transportLogs.length >= MAX_TRANSPORT_LOGS) {
    transportLogs.splice(0, Math.floor(MAX_TRANSPORT_LOGS / 4));
  }
  transportLogs.push(log);
  console.log(`[API REQUEST] ${method} ${url}`);
}

/**
 * Log API response
 */
export function logResponse(
  method: string,
  url: string,
  status: number,
  duration: number
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const log: TransportLog = {
    timestamp: new Date().toISOString(),
    level: status >= 400 ? 'error' : 'info',
    method,
    url,
    status,
    duration,
  };
  
  if (transportLogs.length >= MAX_TRANSPORT_LOGS) {
    transportLogs.splice(0, Math.floor(MAX_TRANSPORT_LOGS / 4));
  }
  transportLogs.push(log);
  
  if (status >= 400) {
    console.error(`[API ERROR] ${status} ${method} ${url} (${duration}ms)`);
  } else {
    console.log(`[API RESPONSE] ${status} ${method} ${url} (${duration}ms)`);
  }
}

/**
 * Log API error
 */
export function logApiError(
  method: string,
  url: string,
  error: string,
  duration?: number
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const log: TransportLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    method,
    url,
    error,
    duration,
  };
  
  if (transportLogs.length >= MAX_TRANSPORT_LOGS) {
    transportLogs.splice(0, Math.floor(MAX_TRANSPORT_LOGS / 4));
  }
  transportLogs.push(log);
  console.error(`[API ERROR] ${method} ${url} - ${error}${duration ? ` (${duration}ms)` : ''}`);
}

/**
 * Get all transport logs
 */
export function getTransportLogs(): TransportLog[] {
  return [...transportLogs];
}

/**
 * Clear transport logs
 */
export function clearTransportLogs(): void {
  transportLogs.length = 0;
}

/**
 * Get failed requests only
 */
export function getFailedRequests(): TransportLog[] {
  return transportLogs.filter(log => log.level === 'error');
}

/**
 * Get query error logs
 */
export function getQueryErrorLogs(): TransportLog[] {
  return transportLogs.filter(log => log.error);
}