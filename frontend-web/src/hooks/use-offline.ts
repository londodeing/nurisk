/**
 * Unified Offline Hook for NURisk
 * Combines offline status, queue management, and conflict handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfflineStatus } from './use-offline-status';
import * as offline from '@/lib/offline';
import { ConflictItem } from '@/lib/indexedDB';

interface UseOfflineReturn {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  queueCount: number;
  isSyncing: boolean;
  conflicts: ConflictItem[];
  showConflictDialog: boolean;
  currentConflict: ConflictItem | null;
  initOffline: () => Promise<void>;
  queueMutation: (
    entity: 'incident' | 'assessment' | 'volunteer' | 'report',
    action: 'create' | 'update' | 'delete',
    method: string,
    url: string,
    data?: unknown,
    version?: number
  ) => Promise<string>;
  syncNow: () => Promise<void>;
  resolveConflictLocal: (conflictId: string) => Promise<void>;
  resolveConflictServer: (conflictId: string) => Promise<void>;
  saveDraft: (formId: string, data: Record<string, unknown>) => Promise<void>;
  getDraft: (formId: string) => Promise<{ formId: string; data: Record<string, unknown> } | undefined>;
  clearDraft: (formId: string) => Promise<void>;
  dismissConflict: () => void;
}

export function useOffline(): UseOfflineReturn {
  const { isOnline, isOffline, wasOffline } = useOfflineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<ConflictItem | null>(null);

  // Initialize offline service
  const initOffline = useCallback(async () => {
    await offline.initOfflineService();
    
    // Set callbacks
    offline.onSync((count) => {
      setQueueCount(count);
    });

    offline.onConflict((conflict) => {
      setConflicts(prev => [...prev, conflict]);
      setCurrentConflict(conflict);
      setShowConflictDialog(true);
    });

    // Load initial queue count
    const count = await offline.getPendingCount();
    setQueueCount(count);
  }, []);

  // Load conflicts on mount
  useEffect(() => {
    const loadConflicts = async () => {
      const pending = await offline.getPendingConflicts();
      setConflicts(pending);
      
      if (pending.length > 0) {
        setCurrentConflict(pending[0] ?? null);
        setShowConflictDialog(true);
      }
    };
    
    loadConflicts();
  }, []);

  // Queue mutation request
  const queueMutation = useCallback(async (
    entity: 'incident' | 'assessment' | 'volunteer' | 'report',
    action: 'create' | 'update' | 'delete',
    method: string,
    url: string,
    data?: unknown,
    version?: number
  ): Promise<string> => {
    setIsSyncing(true);
    try {
      const id = await offline.queueRequest(entity, action, method, url, data, version);
      const count = await offline.getPendingCount();
      setQueueCount(count);
      return id;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync now
  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      await offline.syncQueue();
      const count = await offline.getPendingCount();
      setQueueCount(count);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Resolve conflict with local version
  const resolveConflictLocal = useCallback(async (conflictId: string) => {
    await offline.resolveWithLocal(conflictId);
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    checkAndShowNextConflict();
  }, []);

  // Resolve conflict with server version
  const resolveConflictServer = useCallback(async (conflictId: string) => {
    await offline.resolveWithServer(conflictId);
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    checkAndShowNextConflict();
  }, []);

  // Check and show next conflict
  const checkAndShowNextConflict = useCallback(() => {
    if (conflicts.length > 1) {
      setCurrentConflict(conflicts[1] ?? null);
      setShowConflictDialog(true);
    } else {
      setCurrentConflict(null);
      setShowConflictDialog(false);
    }
  }, [conflicts]);

  // Save draft
  const saveDraft = useCallback(async (formId: string, data: Record<string, unknown>) => {
    await offline.saveFormDraft(formId, data);
  }, []);

  // Get draft
  const getDraft = useCallback(async (formId: string) => {
    return offline.getFormDraft(formId);
  }, []);

  // Clear draft
  const clearDraft = useCallback(async (formId: string) => {
    await offline.clearFormDraft(formId);
  }, []);

  // Dismiss conflict dialog
  const dismissConflict = useCallback(() => {
    setShowConflictDialog(false);
  }, []);

  return {
    isOnline,
    isOffline,
    wasOffline,
    queueCount,
    isSyncing,
    conflicts,
    showConflictDialog,
    currentConflict,
    initOffline,
    queueMutation,
    syncNow,
    resolveConflictLocal,
    resolveConflictServer,
    saveDraft,
    getDraft,
    clearDraft,
    dismissConflict,
  };
}

export default useOffline;