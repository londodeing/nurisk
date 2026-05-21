/**
 * useNativeNetwork Hook
 * Network status with web fallback
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getNetworkStatus,
  addNetworkListener,
  removeNetworkListener,
  isNativePlatform,
  isOnline,
  isOnWifi,
  isOnCellular,
  getConnectionTypeLabel,
  getConnectionIcon,
  type NetworkStatus,
  type ConnectionType,
} from '@/services/native/network';

// =============================================================================
// Hook
// =============================================================================

export function useNativeNetwork() {
  const [status, setStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current network status
   */
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const networkStatus = await getNetworkStatus();
      setStatus(networkStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get network status';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if online
   */
  const checkOnline = useCallback(async (): Promise<boolean> => {
    return isOnline();
  }, []);

  /**
   * Check if on WiFi
   */
  const checkWifi = useCallback(async (): Promise<boolean> => {
    return isOnWifi();
  }, []);

  /**
   * Check if on cellular
   */
  const checkCellular = useCallback(async (): Promise<boolean> => {
    return isOnCellular();
  }, []);

  // Set up listener on mount
  useEffect(() => {
    let cancelled = false;

    async function setup() {
      // Get initial status
      await fetchStatus();

      if (cancelled) return;

      // Add listener
      await addNetworkListener((newStatus) => {
        if (!cancelled) {
          setStatus(newStatus);
        }
      });
    }

    setup();

    return () => {
      cancelled = true;
      removeNetworkListener();
    };
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    isNative: isNativePlatform(),
    connected: status.connected,
    connectionType: status.connectionType,
    fetchStatus,
    checkOnline,
    checkWifi,
    checkCellular,
    // Utility functions
    getConnectionTypeLabel,
    getConnectionIcon,
  };
}

// =============================================================================
// Simple Online Status Hook
// =============================================================================

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online };
}

// =============================================================================
// Connection Type Hook
// =============================================================================

export function useConnectionType() {
  const [connectionType, setConnectionType] = useState<ConnectionType>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchType() {
      try {
        const status = await getNetworkStatus();
        if (!cancelled) {
          setConnectionType(status.connectionType);
        }
      } catch {
        // Ignore
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchType();

    // Listen for changes
    addNetworkListener((status) => {
      if (!cancelled) {
        setConnectionType(status.connectionType);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    connectionType,
    loading,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
    isEthernet: connectionType === 'ethernet',
    isUnknown: connectionType === 'unknown',
    label: getConnectionTypeLabel(connectionType),
    icon: getConnectionIcon(connectionType),
  };
}