/**
 * useRiskRegistry Hook
 * Risk registry data fetching and management
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskApi } from '@nurisk/sdk';
import type {
  Risk,
  RiskFilters,
  RiskSummary,
  RiskMatrixCell,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  RiskCategory,
} from '@nurisk/shared-types/risk';

// =============================================================================
// Utility functions (SDK doesn't have these, implement locally)
// =============================================================================

function getRiskLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 15) return 'high'
  if (score >= 8) return 'medium'
  return 'low'
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get all risks
 */
export function useRisks(filters?: RiskFilters) {
  return useQuery({
    queryKey: ['risks', filters],
    queryFn: () => riskApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get risk by ID
 */
export function useRiskById(id: string) {
  return useQuery({
    queryKey: ['risks', id],
    queryFn: () => riskApi.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Get risk summary
 */
export function useRiskSummary() {
  return useQuery({
    queryKey: ['risks', 'summary'],
    queryFn: riskApi.getSummary,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get risk matrix
 */
export function useRiskMatrix() {
  return useQuery({
    queryKey: ['risks', 'matrix'],
    queryFn: riskApi.getMatrix,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create risk mutation
 * SDK METHOD MISSING: create() - using assess() as fallback
 */
export function useCreateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (risk: {
      name: string
      description: string
      category: string
      likelihood: number
      impact: number
      mitigation?: string
    }) => riskApi.assess(risk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

/**
 * Update risk mutation
 */
export function useUpdateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Risk> }) =>
      riskApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risks', variables.id] });
    },
  });
}

/**
 * Delete risk mutation
 */
export function useDeleteRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => riskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

// =============================================================================
// Derived Hooks
// =============================================================================

/**
 * Get high risks only
 */
export function useHighRisks() {
  const { data: risks, ...rest } = useRisks({ minLikelihood: 4 as RiskLikelihood });

  if (!risks) {
    throw new Error('[risk-registry/high-risks] Invalid response: missing risks data');
  }
  const highRisks = risks.filter((r) => r.inherentRisk >= 15);

  return {
    ...rest,
    data: highRisks,
  };
}

/**
 * Get risks by status
 */
export function useRisksByStatus(status: RiskStatus) {
  const { data: risks, ...rest } = useRisks({ status });

  if (!risks) {
    throw new Error('[risk-registry/risks-by-status] Invalid response: missing risks data');
  }

  return {
    ...rest,
    data: risks,
  };
}

/**
 * Get risks by category
 */
export function useRisksByCategory(category: RiskCategory) {
  const { data: risks, ...rest } = useRisks({ category });

  if (!risks) {
    throw new Error('[risk-registry/risks-by-category] Invalid response: missing risks data');
  }

  return {
    ...rest,
    data: risks,
  };
}

/**
 * Get open risks (not closed)
 */
export function useOpenRisks() {
  const { data: allRisks, ...rest } = useRisks();

  if (!allRisks) {
    throw new Error('[risk-registry/open-risks] Invalid response: missing risks data');
  }
  const openRisks = allRisks.filter((r) => r.status !== 'closed');

  return {
    ...rest,
    data: openRisks,
  };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Calculate risk scores
 */
export function useRiskScores() {
  const { data: risks } = useRisks();

  if (!risks) {
    throw new Error('[risk-registry/scores] Invalid response: missing risks data');
  }
  const scores = risks.map((risk) => ({
    id: risk.id,
    title: risk.title,
    inherentRisk: risk.inherentRisk,
    residualRisk: risk.residualRisk,
    level: getRiskLevel(risk.inherentRisk),
  }));

  return scores;
}

/**
 * Get risk statistics
 */
export function useRiskStats() {
  const { data: summary } = useRiskSummary();

  if (!summary) {
    return {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      closed: 0,
    };
  }

  return {
    total: summary.total,
    high: summary.highRisk,
    medium: summary.mediumRisk,
    low: summary.lowRisk,
    open:
      (summary.byStatus.identified ?? 0) +
      (summary.byStatus.mitigating ?? 0) +
      (summary.byStatus.monitoring ?? 0),
    closed: summary.byStatus.closed ?? 0,
  };
}

// =============================================================================
// Export types
// =============================================================================

export type {
  Risk,
  RiskFilters,
  RiskSummary,
  RiskMatrixCell,
  RiskLikelihood,
  RiskImpact,
  RiskStatus,
  RiskCategory,
};