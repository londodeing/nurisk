/**
 * NURisk Debug Utilities
 * Development mode only debugging tools
 * 
 * IMPORTANT: Only available in development mode
 * Access via window.__NURISK_DEBUG__
 */

import { getTransportLogs, clearTransportLogs, getFailedRequests } from './transport-logger';

/**
 * Debug state interface
 */
interface NURiskDebug {
  // Transport logs
  transportLogs: () => ReturnType<typeof getTransportLogs>;
  failedRequests: () => ReturnType<typeof getFailedRequests>;
  clearTransportLogs: () => void;
  
  // Query info
  activeQueries: () => string[];
  failedQueries: () => string[];
  
  // SDK contract errors
  contractErrors: () => ContractError[];
  
  // Utility
  version: string;
  timestamp: string;
}

/**
 * Contract error interface
 */
interface ContractError {
  endpoint: string;
  message: string;
  timestamp: string;
}

const contractErrors: ContractError[] = [];

/**
 * Log SDK contract error
 */
export function logContractError(endpoint: string, message: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  contractErrors.push({
    endpoint,
    message,
    timestamp: new Date().toISOString(),
  });
  
  console.error(`[SDK CONTRACT ERROR] Endpoint: ${endpoint}`);
  console.error(`  ${message}`);
}

/**
 * Get all contract errors
 */
export function getContractErrors(): ContractError[] {
  return [...contractErrors];
}

/**
 * Clear contract errors
 */
export function clearContractErrors(): void {
  contractErrors.length = 0;
}

/**
 * Create debug object
 */
function createDebugObject(): NURiskDebug {
  return {
    // Transport
    transportLogs: getTransportLogs,
    failedRequests: getFailedRequests,
    clearTransportLogs: () => {
      clearTransportLogs();
      console.log('[DEBUG] Transport logs cleared');
    },
    
    // Queries - placeholder (would need queryClient integration)
    activeQueries: () => [],
    failedQueries: () => [],
    
    // Contract errors
    contractErrors: getContractErrors,
    
    // Info
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Initialize debug in development mode
 */
export function initDebug(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const debug = createDebugObject();
  
  // Expose to window
  if (typeof window !== 'undefined') {
    (window as any).__NURISK_DEBUG__ = debug;
    console.log('[DEBUG] NURisk debug initialized');
    console.log('[DEBUG] Access debug via window.__NURISK_DEBUG__');
  }
}

/**
 * Get debug object
 */
export function getDebug(): NURiskDebug | null {
  if (typeof window === 'undefined') return null;
  return (window as any).__NURISK_DEBUG__ ?? null;
}