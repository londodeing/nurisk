/**
 * @deprecated Use SDK from @nurisk/sdk instead.
 *             Migrate to: import { sdk } from '@/services/api'
 */
/**
 * Network Service
 * Network status detection via Capacitor with web fallback
 */

import { Network } from '@capacitor/network';

// =============================================================================
// Types
// =============================================================================

export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';

export interface NetworkStatus {
  connected: boolean;
  connectionType: ConnectionType;
}

// =============================================================================
// Utility: Check Platform
// =============================================================================

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return (
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

// =============================================================================
// Network Status
// =============================================================================

/**
 * Get current network status
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    if (isNativePlatform()) {
      // Use Capacitor Network
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: mapConnectionType(status.connectionType),
      };
    } else {
      // Web fallback
      return getNetworkStatusWeb();
    }
  } catch (error) {
    console.error('Get network status error:', error);
    return { connected: false, connectionType: 'none' };
  }
}

/**
 * Map Capacitor connection type to our type
 */
function mapConnectionType(type: string): ConnectionType {
  switch (type) {
    case 'wifi':
      return 'wifi';
    case 'cellular':
      return 'cellular';
    case 'ethernet':
      return 'ethernet';
    case 'none':
      return 'none';
    default:
      return 'unknown';
  }
}

/**
 * Web fallback for network status
 */
function getNetworkStatusWeb(): NetworkStatus {
  const connection = (navigator as Navigator & { connection?: NetworkInformation })?.connection;

  if (!connection) {
    return { connected: navigator.onLine, connectionType: 'unknown' };
  }

  let connectionType: ConnectionType = 'unknown';

  if (connection.effectiveType === '4g') {
    connectionType = 'cellular';
  } else if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
    connectionType = 'cellular';
  } else if (connection.type === 'wifi') {
    connectionType = 'wifi';
  } else if (connection.type === 'ethernet') {
    connectionType = 'ethernet';
  }

  return {
    connected: navigator.onLine,
    connectionType,
  };
}

// =============================================================================
// Network Listeners
// =============================================================================

type NetworkCallback = (status: NetworkStatus) => void;
let listenerAdded = false;
let networkCallback: NetworkCallback | null = null;

/**
 * Add network status listener
 */
export async function addNetworkListener(
  callback: NetworkCallback
): Promise<void> {
  networkCallback = callback;

  if (listenerAdded) {
    return;
  }

  try {
    if (isNativePlatform()) {
      // Use Capacitor Network
      await Network.addListener('networkStatusChange', (status) => {
        if (networkCallback) {
          networkCallback({
            connected: status.connected,
            connectionType: mapConnectionType(status.connectionType),
          });
        }
      });
      listenerAdded = true;
    } else {
      // Web fallback
      window.addEventListener('online', handleOnlineChange);
      window.addEventListener('offline', handleOnlineChange);
      listenerAdded = true;
    }
  } catch (error) {
    console.error('Add network listener error:', error);
  }
}

/**
 * Handle online/offline events
 */
function handleOnlineChange() {
  if (networkCallback) {
    networkCallback(getNetworkStatusWeb());
  }
}

/**
 * Remove network status listener
 */
export async function removeNetworkListener(): Promise<void> {
  try {
    if (isNativePlatform()) {
      await Network.removeAllListeners();
    } else {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    }
    listenerAdded = false;
    networkCallback = null;
  } catch (error) {
    console.error('Remove network listener error:', error);
  }
}

// =============================================================================
// Utility
// =============================================================================

/**
 * Check if online
 */
export async function isOnline(): Promise<boolean> {
  const status = await getNetworkStatus();
  return status.connected;
}

/**
 * Check if on WiFi
 */
export async function isOnWifi(): Promise<boolean> {
  const status = await getNetworkStatus();
  return status.connectionType === 'wifi';
}

/**
 * Check if on cellular
 */
export async function isOnCellular(): Promise<boolean> {
  const status = await getNetworkStatus();
  return status.connectionType === 'cellular';
}

/**
 * Get connection type label
 */
export function getConnectionTypeLabel(type: ConnectionType): string {
  switch (type) {
    case 'wifi':
      return 'WiFi';
    case 'cellular':
      return 'Seluler';
    case 'ethernet':
      return 'Ethernet';
    case 'none':
      return 'Tidak ada koneksi';
    default:
      return 'Unknown';
  }
}

/**
 * Get connection icon
 */
export function getConnectionIcon(type: ConnectionType): string {
  switch (type) {
    case 'wifi':
      return '📶';
    case 'cellular':
      return '📱';
    case 'ethernet':
      return '🔌';
    case 'none':
      return '🚫';
    default:
      return '❓';
  }
}