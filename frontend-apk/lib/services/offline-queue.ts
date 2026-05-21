/**
 * Offline Queue Service
 * =================
 * Handles offline action queue with persistence
 */

export type QueueActionType = 
  | 'CREATE_INCIDENT' 
  | 'CHECK_IN' 
  | 'SEND_MESSAGE' 
  | 'UPDATE_PROFILE' 
  | 'UPDATE_INCIDENT'
  | 'CREATE_REPORT';

export type QueueStatus = 'PENDING' | 'IN_FLIGHT' | 'COMPLETED' | 'FAILED';

export interface QueueEntry {
  queue_id: string;
  action: QueueActionType;
  payload: Record<string, unknown>;
  created_at: number;
  retry_count: number;
  status: QueueStatus;
  last_attempt?: number;
  error?: string;
}

export interface QueueConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 60000,
};

// IndexedDB configuration
const DB_NAME = 'nurisk_offline_queue';
const DB_VERSION = 1;
const STORE_NAME = 'queue';

/**
 * Offline Queue Service
 */
export class OfflineQueueService {
  private db: IDBDatabase | null = null;
  private config: QueueConfig;
  private processing: boolean = false;
  private onlineListener?: () => void;

  constructor(config?: Partial<QueueConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'queue_id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  /**
   * Add action to queue
   */
  async enqueue(action: QueueActionType, payload: Record<string, unknown>): Promise<string> {
    const queueId = this.generateUUID();
    const entry: QueueEntry = {
      queue_id: queueId,
      action,
      payload,
      created_at: Date.now(),
      retry_count: 0,
      status: 'PENDING',
    };

    await this.saveEntry(entry);
    return queueId;
  }

  /**
   * Get queue entry
   */
  async getEntry(queueId: string): Promise<QueueEntry | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(queueId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all pending entries
   */
  async getPending(): Promise<QueueEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('PENDING');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Update entry status
   */
  async updateStatus(
    queueId: string,
    status: QueueStatus,
    error?: string
  ): Promise<void> {
    const entry = await this.getEntry(queueId);
    if (!entry) return;

    entry.status = status;
    entry.last_attempt = Date.now();
    if (error) entry.error = error;
    if (status === 'PENDING') entry.retry_count++;

    await this.saveEntry(entry);
  }

  /**
   * Process queue
   */
  async processQueue(
    executeFn: (entry: QueueEntry) => Promise<boolean>
  ): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const pending = await this.getPending();
      
      for (const entry of pending) {
        // Check if max retries exceeded
        if (entry.retry_count >= this.config.maxRetries) {
          await this.updateStatus(entry.queue_id, 'FAILED', 'Max retries exceeded');
          continue;
        }

        // Mark as in flight
        await this.updateStatus(entry.queue_id, 'IN_FLIGHT');

        try {
          const success = await executeFn(entry);
          
          if (success) {
            await this.updateStatus(entry.queue_id, 'COMPLETED');
          } else {
            await this.handleRetry(entry.queue_id);
          }
        } catch (error) {
          await this.handleRetry(entry.queue_id, (error as Error).message);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Handle retry with exponential backoff
   */
  private async handleRetry(queueId: string, error?: string): Promise<void> {
    const entry = await this.getEntry(queueId);
    if (!entry) return;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, entry.retry_count),
      this.config.maxDelay
    );

    // Update retry count and status
    entry.retry_count++;
    entry.status = 'PENDING';
    entry.last_attempt = Date.now();
    entry.error = error;

    await this.saveEntry(entry);

    // Schedule retry
    setTimeout(async () => {
      await this.processQueue(async () => true);
    }, delay);
  }

  /**
   * Clear completed entries
   */
  async clearCompleted(): Promise<number> {
    const entries = await this.getAll();
    let cleared = 0;

    for (const entry of entries) {
      if (entry.status === 'COMPLETED') {
        await this.deleteEntry(entry.queue_id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear failed entries
   */
  async clearFailed(): Promise<number> {
    const entries = await this.getAll();
    let cleared = 0;

    for (const entry of entries) {
      if (entry.status === 'FAILED') {
        await this.deleteEntry(entry.queue_id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get all entries
   */
  async getAll(): Promise<QueueEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Get queue stats
   */
  async getStats(): Promise<Record<QueueStatus, number>> {
    const entries = await this.getAll();
    const stats: Record<QueueStatus, number> = {
      PENDING: 0,
      IN_FLIGHT: 0,
      COMPLETED: 0,
      FAILED: 0,
    };

    for (const entry of entries) {
      stats[entry.status]++;
    }

    return stats;
  }

  /**
   * Save entry to database
   */
  private async saveEntry(entry: QueueEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete entry from database
   */
  private async deleteEntry(queueId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(queueId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0;
      return v.toString(16);
    });
  }

  /**
   * Start online listener
   */
  startOnlineListener(executeFn: (entry: QueueEntry) => Promise<boolean>): void {
    this.onlineListener = () => {
      this.processQueue(executeFn);
    };
    window.addEventListener('online', this.onlineListener);
  }

  /**
   * Stop online listener
   */
  stopOnlineListener(): void {
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = undefined;
    }
  }

  /**
   * Close database
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.stopOnlineListener();
  }
}

// Export for CommonJS
export { OfflineQueueService };