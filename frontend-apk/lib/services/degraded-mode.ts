/**
 * Degraded Mode Manager
 * ====================
 * Detects and manages online/offline connection states
 */

import { EventEmitter } from 'events';

export enum ConnectionState {
  ONLINE = 'ONLINE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
}

export interface ConnectionStatus {
  state: ConnectionState;
  lastChecked: Date;
  latencyMs: number | null;
  error: string | null;
}

type ConnectionChangeListener = (status: ConnectionStatus) => void;

class DegradedModeManager extends EventEmitter {
  private static instance: DegradedModeManager;
  private currentState: ConnectionState = ConnectionState.ONLINE;
  private lastChecked: Date = new Date();
  private latencyMs: number | null = null;
  private error: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Set<ConnectionChangeListener> = new Set();
  private healthCheckUrl: string = '/api/health';
  private checkIntervalMs: number = 10000;
  private timeoutMs: number = 5000;

  private constructor() {
    super();
    this.setupBrowserListeners();
  }

  static getInstance(): DegradedModeManager {
    if (!DegradedModeManager.instance) {
      DegradedModeManager.instance = new DegradedModeManager();
    }
    return DegradedModeManager.instance;
  }

  /**
   * Setup browser online/offline event listeners
   */
  private setupBrowserListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });
  }

  /**
   * Handle browser going online
   */
  private handleOnline(): void {
    this.updateState(ConnectionState.ONLINE);
    this.checkConnection();
  }

  /**
   * Handle browser going offline
   */
  private handleOffline(): void {
    this.updateState(ConnectionState.OFFLINE);
  }

  /**
   * Start periodic connection health checks
   */
  startMonitoring(): void {
    if (this.checkInterval) return;

    // Initial check
    this.checkConnection();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.checkIntervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check connection to server
   */
  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();

    try {
      // Check navigator.onLine first
      if (!navigator.onLine) {
        this.updateState(ConnectionState.OFFLINE);
        return this.getStatus();
      }

      // Try health check endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(this.healthCheckUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (response.ok) {
        this.latencyMs = latency;
        this.error = null;

        // Determine if degraded or online based on latency
        if (latency > 3000) {
          this.updateState(ConnectionState.DEGRADED);
        } else {
          this.updateState(ConnectionState.ONLINE);
        }
      } else {
        this.error = `HTTP ${response.status}`;
        this.updateState(ConnectionState.DEGRADED);
      }
    } catch (err) {
      this.error = (err as Error).message;
      this.updateState(ConnectionState.OFFLINE);
    }

    return this.getStatus();
  }

  /**
   * Update connection state and notify listeners
   */
  private updateState(newState: ConnectionState): void {
    if (this.currentState === newState) return;

    const previousState = this.currentState;
    this.currentState = newState;
    this.lastChecked = new Date();

    // Emit change event
    this.emit('change', this.getStatus());

    // Notify listeners
    for (const listener of this.listeners) {
      listener(this.getStatus());
    }

    console.log(`[DEGRADED_MODE] State changed: ${previousState} → ${newState}`);
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return {
      state: this.currentState,
      lastChecked: this.lastChecked,
      latencyMs: this.latencyMs,
      error: this.error,
    };
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.currentState;
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentState === ConnectionState.ONLINE;
  }

  /**
   * Check if in degraded mode
   */
  isDegraded(): boolean {
    return this.currentState === ConnectionState.DEGRADED;
  }

  /**
   * Check if offline
   */
  isOffline(): boolean {
    return this.currentState === ConnectionState.OFFLINE;
  }

  /**
   * Add connection change listener
   */
  onConnectionChange(listener: ConnectionChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove connection change listener
   */
  offConnectionChange(listener: ConnectionChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Set health check URL
   */
  setHealthCheckUrl(url: string): void {
    this.healthCheckUrl = url;
  }

  /**
   * Set check interval
   */
  setCheckInterval(ms: number): void {
    this.checkIntervalMs = ms;
    if (this.checkInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Set timeout for health checks
   */
  setTimeout(ms: number): void {
    this.timeoutMs = ms;
  }
}

// Export singleton
export const degradedModeManager = DegradedModeManager.getInstance();

// Export for CommonJS
export { DegradedModeManager };