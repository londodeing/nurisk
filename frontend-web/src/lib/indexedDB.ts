/**
 * IndexedDB for NURisk Offline Support
 * Database: nurisk-offline
 */

const DB_NAME = 'nurisk-offline';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  OFFLINE_QUEUE: 'offlineQueue',
  CACHED_INCIDENTS: 'cachedIncidents',
  CACHED_VOLUNTEERS: 'cachedVolunteers',
  DRAFT_FORMS: 'draftForms',
  CONFLICTS: 'conflicts',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

// Type definitions
export interface OfflineQueueItem {
  id: string;
  entity: 'incident' | 'assessment' | 'volunteer' | 'report';
  action: 'create' | 'update' | 'delete';
  method: string;
  url: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
  version?: number;
}

export interface CachedIncident {
  id: string;
  data: unknown;
  cachedAt: number;
  version: number;
}

export interface CachedVolunteer {
  id: string;
  data: unknown;
  cachedAt: number;
  version: number;
}

export interface DraftForm {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  savedAt: number;
}

export interface ConflictItem {
  id: string;
  entity: string;
  entityId: string;
  localVersion: unknown;
  serverVersion: unknown;
  detectedAt: number;
  resolved: boolean;
}

// Database instance
let db: IDBDatabase | null = null;

/**
 * Open IndexedDB connection
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
        database.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.CACHED_INCIDENTS)) {
        const store = database.createObjectStore(STORES.CACHED_INCIDENTS, { keyPath: 'id' });
        store.createIndex('cachedAt', 'cachedAt');
      }

      if (!database.objectStoreNames.contains(STORES.CACHED_VOLUNTEERS)) {
        const store = database.createObjectStore(STORES.CACHED_VOLUNTEERS, { keyPath: 'id' });
        store.createIndex('cachedAt', 'cachedAt');
      }

      if (!database.objectStoreNames.contains(STORES.DRAFT_FORMS)) {
        const store = database.createObjectStore(STORES.DRAFT_FORMS, { keyPath: 'id' });
        store.createIndex('formId', 'formId');
        store.createIndex('savedAt', 'savedAt');
      }

      if (!database.objectStoreNames.contains(STORES.CONFLICTS)) {
        const store = database.createObjectStore(STORES.CONFLICTS, { keyPath: 'id' });
        store.createIndex('entity', 'entity');
        store.createIndex('resolved', 'resolved');
      }
    };
  });
}

/**
 * Add item to offline queue
 */
export async function addToQueue(item: OfflineQueueItem): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from offline queue
 */
export async function getQueue(): Promise<OfflineQueueItem[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.OFFLINE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove item from offline queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear offline queue
 */
export async function clearQueue(): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache incident data
 */
export async function cacheIncident(id: string, data: unknown, version: number): Promise<void> {
  const database = await openDB();
  const item: CachedIncident = {
    id,
    data,
    cachedAt: Date.now(),
    version,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CACHED_INCIDENTS], 'readwrite');
    const store = transaction.objectStore(STORES.CACHED_INCIDENTS);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached incident
 */
export async function getCachedIncident(id: string): Promise<CachedIncident | undefined> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CACHED_INCIDENTS], 'readonly');
    const store = transaction.objectStore(STORES.CACHED_INCIDENTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache volunteer data
 */
export async function cacheVolunteer(id: string, data: unknown, version: number): Promise<void> {
  const database = await openDB();
  const item: CachedVolunteer = {
    id,
    data,
    cachedAt: Date.now(),
    version,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CACHED_VOLUNTEERS], 'readwrite');
    const store = transaction.objectStore(STORES.CACHED_VOLUNTEERS);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached volunteer
 */
export async function getCachedVolunteer(id: string): Promise<CachedVolunteer | undefined> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CACHED_VOLUNTEERS], 'readonly');
    const store = transaction.objectStore(STORES.CACHED_VOLUNTEERS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save draft form
 */
export async function saveDraft(formId: string, data: Record<string, unknown>): Promise<void> {
  const database = await openDB();
  const item: DraftForm = {
    id: `${formId}-${Date.now()}`,
    formId,
    data,
    savedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.DRAFT_FORMS], 'readwrite');
    const store = transaction.objectStore(STORES.DRAFT_FORMS);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get draft form by formId
 */
export async function getDraft(formId: string): Promise<DraftForm | undefined> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.DRAFT_FORMS], 'readonly');
    const store = transaction.objectStore(STORES.DRAFT_FORMS);
    const index = store.index('formId');
    const request = index.get(formId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete draft form
 */
export async function deleteDraft(formId: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.DRAFT_FORMS], 'readwrite');
    const store = transaction.objectStore(STORES.DRAFT_FORMS);
    const index = store.index('formId');
    const request = index.openCursor(IDBKeyRange.only(formId));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Save conflict
 */
export async function saveConflict(conflict: ConflictItem): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFLICTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONFLICTS);
    const request = store.put(conflict);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get unresolved conflicts
 */
export async function getConflicts(): Promise<ConflictItem[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFLICTS], 'readonly');
    const store = transaction.objectStore(STORES.CONFLICTS);
    const index = store.index('resolved');
    const request = index.getAll(IDBKeyRange.only(false));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark conflict as resolved
 */
export async function resolveConflict(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONFLICTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONFLICTS);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const conflict = getRequest.result as ConflictItem | undefined;
      if (conflict) {
        conflict.resolved = true;
        const putRequest = store.put(conflict);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Get queue count
 */
export async function getQueueCount(): Promise<number> {
  const items = await getQueue();
  return items.length;
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}