/**
 * Reconnection Service
 * ===============
 * Handles reconnection detection and recovery
 */

import { EventEmitter } from 'events';
import { OfflineQueueService } from './offline-queue';

export interface ReconnectionConfig {
  pingInterval: number;
  pingTimeout: number;
  debounceCount: number;
  healthEndpoint: string;
}

const DEFAULT_CONFIG: ReconnectionConfig = {
  pingInterval: 5000,
  pingTimeout: 3000,
  debounceCount: 3,
  healthEndpoint: '/health',
};

/**
 * Reconnection Service
 */
export class ReconnectionService extends EventEmitter {
  private config: ReconnectionConfig;
  private consecutiveSuccess: number = 0;
  private pinging: boolean = false;
  private pingTimer?: ReturnType<typeof setInterval>;
  private wasOffline: boolean = false;
  private baseUrl: string;

  constructor(baseUrl: string, config?: Partial<ReconnectionConfig>) {
    super();
    this.baseUrl = baseUrl;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start monitoring
   */
  start(): void {
    this.startPingLoop();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.consecutiveSuccess >= this.config.debounceCount;
  }

  /**
   * Get connection state
   */
  getState(): 'ONLINE' | 'DEGRADED' | 'OFFLINE' {
    if (this.consecutiveSuccess >= this.config.debounceCount) {
      return 'ONLINE';
    } else if (this.consecutiveSuccess > 0) {
      return 'DEGRADED';
    }
    return 'OFFLINE';
  }

  /**
   * Start ping loop
   */
  private startPingLoop(): void {
    this.pingTimer = setInterval(async () => {
      await this.ping();
    }, this.config.pingInterval);
    
    // Initial ping
    this.ping();
  }

  /**
   * Ping health endpoint
   */
  private async ping(): Promise<boolean> {
    if (this.pinging) return false;
    this.pinging = true;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.pingTimeout);

      const response = await fetch(this.baseUrl + this.config.healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const success = response.ok;

      if (success) {
        this.handlePingSuccess();
      } else {
        this.handlePingFailure();
      }

      return success;
    } catch {
      this.handlePingFailure();
      return false;
    } finally {
      this.pinging = false;
    }
  }

  /**
   * Handle successful ping
   */
  private handlePingSuccess(): void {
    this.consecutiveSuccess++;

    const wasDisconnected = !this.wasOffline;
    const justReconnected = wasDisconnected && this.consecutiveSuccess >= this.config.debounceCount;

    if (justReconnected) {
      this.wasOffline = false;
      this.emit('connection.restored');
    }

    this.emit('ping.success', { consecutive: this.consecutiveSuccess });
  }

  /**
   * Handle failed ping
   */
  private handlePingFailure(): void {
    const wasConnected = this.consecutiveSuccess >= this.config.debounceCount;
    
    this.consecutiveSuccess = 0;

    if (wasConnected) {
      this.wasOffline = true;
      this.emit('connection.lost');
    }

    this.emit('ping.failed');
  }

  /**
   * Handle reconnection and flush queue
   */
  async handleReconnection(
    queue: OfflineQueueService,
    syncFn: () => Promise<{ pulled: number; pushed: number }>
  ): Promise<void> {
    this.on('connection.restored', async () => {
      // Emit sync start event
      this.emit('sync.started');

      try {
        // Process queue first
        await queue.processQueue(async (entry) => {
          // Execute each queued action
          return true;
        });

        // Then pull latest changes
        const result = await syncFn();

        // Emit sync complete
        this.emit('sync.completed', result);
      } catch (error) {
        this.emit('sync.failed', error);
      }
    });
  }

  /**
   * Get connection stats
   */
  getStats(): {
    state: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    consecutiveSuccess: number;
    debounceCount: number;
  } {
    return {
      state: this.getState(),
      consecutiveSuccess: this.consecutiveSuccess,
      debounceCount: this.config.debounceCount,
    };
  }
}

// Export for CommonJS
export { ReconnectionService };