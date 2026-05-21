/**
 * Offline Support Service for NURisk
 * Handles queue management, auto-sync, and conflict resolution
 */

import { client } from '@nurisk/sdk';
import {
  openDB,
  addToQueue,
  getQueue,
  removeFromQueue,
  clearQueue,
  cacheIncident,
  getCachedIncident,
  cacheVolunteer,
  getCachedVolunteer,
  saveDraft,
  getDraft,
  deleteDraft,
  saveConflict,
  getConflicts,
  resolveConflict,
  getQueueCount,
  OfflineQueueItem,
  ConflictItem,
} from './indexedDB';

const MAX_RETRY_COUNT = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

// Event callbacks
type SyncCallback = (count: number) => void;
type ConflictCallback = (conflict: ConflictItem) => void;

let syncInterval: ReturnType<typeof setInterval> | null = null;
let onSyncCallback: SyncCallback | null = null;
let onConflictCallback: ConflictCallback | null = null;
let isSyncing = false;

/**
 * Initialize offline service
 */
export async function initOfflineService(): Promise<void> {
  await openDB();
  startSyncInterval();
  
  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

/**
 * Start sync interval
 */
function startSyncInterval(): void {
  if (syncInterval) return;
  syncInterval = setInterval(syncQueue, SYNC_INTERVAL);
}

/**
 * Stop sync interval
 */
export function stopSyncService(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Handle online event
 */
async function handleOnline(): Promise<void> {
  console.log('Back online - starting sync');
  await syncQueue();
}

/**
 * Handle offline event
 */
function handleOffline(): void {
  console.log('Gone offline');
}

/**
 * Queue a request for later execution
 */
export async function queueRequest(
  entity: OfflineQueueItem['entity'],
  action: OfflineQueueItem['action'],
  method: string,
  url: string,
  data?: unknown,
  version?: number
): Promise<string> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  const item: OfflineQueueItem = {
    id,
    entity,
    action,
    method,
    url,
    data,
    timestamp: Date.now(),
    retryCount: 0,
    version,
  };

  await addToQueue(item);
  
  // Notify sync callback
  const count = await getQueueCount();
  onSyncCallback?.(count);

  // Try to execute immediately if online
  if (navigator.onLine) {
    await syncQueue();
  }

  return id;
}

/**
 * Sync queued requests
 */
export async function syncQueue(): Promise<void> {
  if (!navigator.onLine || isSyncing) return;
  
  isSyncing = true;
  const items = await getQueue();
  
  if (items.length === 0) {
    isSyncing = false;
    onSyncCallback?.(0);
    return;
  }

  const failed: OfflineQueueItem[] = [];

  for (const item of items) {
    try {
      await executeRequest(item);
      await removeFromQueue(item.id);
    } catch (error) {
      console.error('Failed to sync request:', item.id, error);
      
      // Check for conflict (409)
      if (isConflictError(error)) {
        await handleConflict(item, error);
      } else {
        // Increment retry count
        item.retryCount++;
        if (item.retryCount < MAX_RETRY_COUNT) {
          failed.push(item);
        } else {
          console.error('Max retries reached for:', item.id);
        }
      }
    }
  }

  // Re-queue failed items
  for (const item of failed) {
    await addToQueue(item);
  }

  isSyncing = false;
  const count = await getQueueCount();
  onSyncCallback?.(count);
}

/**
 * Execute a queued request
 */
async function executeRequest(item: OfflineQueueItem): Promise<void> {
  const { method, url, data } = item;
  
  switch (method.toUpperCase()) {
    case 'GET':
      await client.get(url);
      break;
    case 'POST':
      await client.post(url, data);
      break;
    case 'PUT':
      await client.put(url, data);
      break;
    case 'PATCH':
      await client.patch(url, data);
      break;
    case 'DELETE':
      await client.delete(url);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

/**
 * Check if error is a conflict (409)
 */
function isConflictError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const axiosError = error as { response?: { status?: number } };
  return axiosError.response?.status === 409;
}

/**
 * Handle conflict
 */
async function handleConflict(item: OfflineQueueItem, error: unknown): Promise<void> {
  const axiosError = error as { response?: { data?: { serverVersion?: unknown } } };
  const serverVersion = axiosError.response?.data?.serverVersion;
  
  const conflict: ConflictItem = {
    id: item.id,
    entity: item.entity,
    entityId: extractEntityId(item.url),
    localVersion: item.data,
    serverVersion,
    detectedAt: Date.now(),
    resolved: false,
  };

  await saveConflict(conflict);
  onConflictCallback?.(conflict);
}

/**
 * Extract entity ID from URL
 */
function extractEntityId(url: string): string {
  const match = url.match(/\/([^/]+)$/);
  return match?.[1] || '';
}

/**
 * Resolve conflict with local version
 */
export async function resolveWithLocal(conflictId: string): Promise<void> {
  const conflicts = await getConflicts();
  const conflict = conflicts.find(c => c.id === conflictId);
  
  if (!conflict) return;

  // Re-queue with force flag
  await queueRequest(
    conflict.entity as OfflineQueueItem['entity'],
    'update',
    'PUT',
    `/${conflict.entity}/${conflict.entityId}`,
    conflict.localVersion
  );

  await resolveConflict(conflictId);
}

/**
 * Resolve conflict with server version
 */
export async function resolveWithServer(conflictId: string): Promise<void> {
  await resolveConflict(conflictId);
}

/**
 * Get pending conflicts
 */
export async function getPendingConflicts(): Promise<ConflictItem[]> {
  return getConflicts();
}

/**
 * Save form draft
 */
export async function saveFormDraft(formId: string, data: Record<string, unknown>): Promise<void> {
  await saveDraft(formId, data);
}

/**
 * Get form draft
 */
export async function getFormDraft(formId: string): Promise<{ formId: string; data: Record<string, unknown> } | undefined> {
  const draft = await getDraft(formId);
  if (!draft) return undefined;
  
  return {
    formId: draft.formId,
    data: draft.data,
  };
}

/**
 * Delete form draft
 */
export async function clearFormDraft(formId: string): Promise<void> {
  await deleteDraft(formId);
}

/**
 * Cache incident for offline access
 */
export async function cacheIncidentData(id: string, data: unknown, version: number): Promise<void> {
  await cacheIncident(id, data, version);
}

/**
 * Get cached incident
 */
export async function getCachedIncidentData(id: string): Promise<unknown> {
  const cached = await getCachedIncident(id);
  return cached?.data;
}

/**
 * Cache volunteer for offline access
 */
export async function cacheVolunteerData(id: string, data: unknown, version: number): Promise<void> {
  await cacheVolunteer(id, data, version);
}

/**
 * Get cached volunteer
 */
export async function getCachedVolunteerData(id: string): Promise<unknown> {
  const cached = await getCachedVolunteer(id);
  return cached?.data;
}

/**
 * Get queue count
 */
export async function getPendingCount(): Promise<number> {
  return getQueueCount();
}

/**
 * Set sync callback
 */
export function onSync(callback: SyncCallback): void {
  onSyncCallback = callback;
}

/**
 * Set conflict callback
 */
export function onConflict(callback: ConflictCallback): void {
  onConflictCallback = callback;
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  await clearQueue();
  onSyncCallback?.(0);
}

export default {
  initOfflineService,
  stopOfflineService: stopSyncService,
  queueRequest,
  syncQueue,
  resolveWithLocal,
  resolveWithServer,
  getPendingConflicts,
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
  cacheIncidentData,
  getCachedIncidentData,
  cacheVolunteerData,
  getCachedVolunteerData,
  getPendingCount,
  onSync,
  onConflict,
  clearOfflineData,
};