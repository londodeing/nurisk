import { useState, useEffect, useCallback } from 'react';
import { client } from '@nurisk/sdk';
import { useOfflineStatus } from './use-offline-status';

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
}

const STORAGE_KEY = 'offline_queue';

export function useOfflineQueue() {
  const { isOffline } = useOfflineStatus();
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setQueue(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline queue:', e);
      }
    }
  }, []);

  // Save queue to storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Process queue when back online
  useEffect(() => {
    if (!isOffline && queue.length > 0) {
      processQueue();
    }
  }, [isOffline]);

  const addToQueue = useCallback(async (method: string, url: string, data?: unknown) => {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method,
      url,
      data,
      timestamp: Date.now(),
    };
    
    setQueue(prev => [...prev, request]);
    
    // Try to send immediately if online
    if (!isOffline) {
      try {
        if (method.toLowerCase() === 'get') await client.get(url);
        else if (method.toLowerCase() === 'post') await client.post(url, data);
        else if (method.toLowerCase() === 'patch') await client.patch(url, data);
        else if (method.toLowerCase() === 'delete') await client.delete(url);
        setQueue(prev => prev.filter(r => r.id !== request.id));
      } catch (error) {
        console.error('Failed to send request:', error);
      }
    }
    
    return request.id;
  }, [isOffline]);

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || isSyncing) return;
    
    setIsSyncing(true);
    const failed: QueuedRequest[] = [];
    
    for (const request of queue) {
      try {
        if (request.method.toLowerCase() === 'get') await client.get(request.url);
        else if (request.method.toLowerCase() === 'post') await client.post(request.url, request.data);
        else if (request.method.toLowerCase() === 'patch') await client.patch(request.url, request.data);
        else if (request.method.toLowerCase() === 'delete') await client.delete(request.url);
      } catch (error) {
        console.error('Failed to process queued request:', request, error);
        failed.push(request);
      }
    }
    
    setQueue(failed);
    setIsSyncing(false);
  }, [queue, isSyncing]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getQueueCount = useCallback(() => queue.length, [queue]);

  return {
    queue,
    isSyncing,
    addToQueue,
    processQueue,
    clearQueue,
    getQueueCount,
  };
}

export default useOfflineQueue;