import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAgents,
  getAgent,
  getAgentLogs,
  getAgentActions,
  getAgentErrors,
  getAgentResourceUsage,
  getBiasReport,
  getBiasAlerts,
  toggleAgent,
  Agent,
  AgentLog,
  AgentAction,
  AgentError,
  ResourceUsage,
  BiasReport,
  BiasAlert,
  AgentConfig,
} from '@/services/agentService';

// ============================================
// Hooks - Agent Governance
// ============================================

/**
 * Get all agents
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: getAgents,
    staleTime: 30 * 1000,
  });
}

/**
 * Get single agent
 */
export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => getAgent(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Get agent logs
 */
export function useAgentLogs(params?: {
  agentId?: string;
  level?: 'info' | 'warn' | 'error';
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['agentLogs', params],
    queryFn: () => getAgentLogs(params),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000, // Real-time updates every 10s
  });
}

/**
 * Get agent actions
 */
export function useAgentActions(agentId: string, limit = 10) {
  return useQuery({
    queryKey: ['agentActions', agentId, limit],
    queryFn: () => getAgentActions(agentId, limit),
    enabled: !!agentId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get agent errors
 */
export function useAgentErrors(agentId: string, limit = 10) {
  return useQuery({
    queryKey: ['agentErrors', agentId, limit],
    queryFn: () => getAgentErrors(agentId, limit),
    enabled: !!agentId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get agent resource usage
 */
export function useAgentResourceUsage(agentId: string, duration = 60) {
  return useQuery({
    queryKey: ['agentResourceUsage', agentId, duration],
    queryFn: () => getAgentResourceUsage(agentId, duration),
    enabled: !!agentId,
    staleTime: 30 * 1000,
  });
}

/**
 * Toggle agent on/off
 */
export function useToggleAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleAgent(id, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', variables.id] });
    },
  });
}

/**
 * Update agent config
 */
export function useUpdateAgentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: Partial<AgentConfig> }) =>
      getAgent(id).then(() => {
        // Mock update - in real app would call API
        return { id, config };
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', variables.id] });
    },
  });
}

// ============================================
// Hooks - Bias Monitoring
// ============================================

/**
 * Get bias report
 */
export function useBiasReport(days = 30) {
  return useQuery({
    queryKey: ['biasReport', days],
    queryFn: () => getBiasReport(days),
    staleTime: 60 * 1000,
  });
}

/**
 * Get bias alerts
 */
export function useBiasAlerts(limit = 10) {
  return useQuery({
    queryKey: ['biasAlerts', limit],
    queryFn: () => getBiasAlerts(limit),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Check for new alerts every 30s
  });
}

// ============================================
// Types for export
// ============================================

export type {
  Agent,
  AgentLog,
  AgentAction,
  AgentError,
  ResourceUsage,
  BiasReport,
  BiasAlert,
  AgentConfig,
};