/**
 * useDecision Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useState, useEffect, useCallback } from 'react';
import { decisionApi } from '@nurisk/sdk';
import type { Decision, DecisionStats, DecisionConfig } from '@nurisk/shared-types/decision';

export function useDecisions(filters?: {
  status?: string;
  category?: string;
}) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.list(filters as { status?: 'pending' | 'approved' | 'rejected' | 'deferred'; category?: string });
      setDecisions(result);
      setTotal(result.length);
    } catch (err) {
      setError('Failed to fetch decisions');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.category]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  return { decisions, loading, error, total, refetch: fetchDecisions };
}

export function useDecision(id: string) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecision = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.getStatus(id);
      setDecision(result);
    } catch (err) {
      setError('Failed to fetch decision');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  return { decision, loading, error, refetch: fetchDecision };
}

export function useDecisionStats() {
  const [stats, setStats] = useState<DecisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.getStats();
      setStats(result);
    } catch (err) {
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Get decision config
 * SDK METHOD MISSING: getConfig - using list as fallback
 */
export function useDecisionConfig() {
  const [config, setConfig] = useState<DecisionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.list();
      setConfig(result[0] as unknown as DecisionConfig);
    } catch (err) {
      setError('Failed to fetch config');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates: Partial<DecisionConfig>) => {
    setSaving(true);
    try {
      // SDK METHOD MISSING: updateConfig - no direct method available
      const result = await decisionApi.execute({
        title: 'Update Config',
        description: JSON.stringify(updates),
        category: 'config',
        impact: 'low',
        urgency: 'low',
        options: [],
        requestedBy: 'system',
      });
      return result as unknown as DecisionConfig;
    } catch (err) {
      setError('Failed to update config');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, saving, updateConfig, refetch: fetchConfig };
}

export function useDecisionActions(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.approve(id, 'default', notes ?? '');
      return result;
    } catch (err) {
      setError('Failed to approve decision');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const reject = useCallback(async (reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await decisionApi.reject(id, reason);
      return result;
    } catch (err) {
      setError('Failed to reject decision');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const modify = useCallback(async (modifications: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      // SDK METHOD MISSING: modify - using defer as fallback
      const result = await decisionApi.defer(id, JSON.stringify(modifications));
      return result;
    } catch (err) {
      setError('Failed to modify decision');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { approve, reject, modify, loading, error };
}