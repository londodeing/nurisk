'use client';

import { useState } from 'react';
import {
  Agent,
  getAgentStatusColor,
  getAgentStatusLabel,
  formatUptime,
} from '@/services/agentService';
import { useAgentActions, useAgentErrors, useAgentResourceUsage } from '@/hooks/use-agents';
import { Badge } from '@/components/ui/badge';

interface AgentDetailProps {
  agent: Agent;
}

export function AgentDetail({ agent }: AgentDetailProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'metrics' | 'actions' | 'errors' | 'resources'>('config');

  const { data: actions } = useAgentActions(agent.id, 10);
  const { data: errors } = useAgentErrors(agent.id, 10);
  const { data: resources } = useAgentResourceUsage(agent.id, 60);

  const tabs = [
    { id: 'config', label: 'Konfigurasi' },
    { id: 'metrics', label: 'Metrik' },
    { id: 'actions', label: 'Aksi Terbaru' },
    { id: 'errors', label: 'Riwayat Error' },
    { id: 'resources', label: 'Resource Usage' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getAgentStatusColor(agent.status) }}
        />
        <span className="font-medium text-slate-700">
          {getAgentStatusLabel(agent.status)}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-sm text-slate-500">
          Uptime: {formatUptime(agent.uptime)}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-sm text-slate-500">
          {agent.actionsCount.toLocaleString('id-ID')} actions
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-nu-green border-nu-green'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Model</label>
                <p className="text-sm text-slate-700">{agent.config.model || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Timeout</label>
                <p className="text-sm text-slate-700">
                  {agent.config.timeout ? `${agent.config.timeout}ms` : '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Max Retries</label>
                <p className="text-sm text-slate-700">
                  {agent.config.maxRetries ?? '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Enabled</label>
                <p className="text-sm text-slate-700">
                  {agent.config.enabled ? 'Ya' : 'Tidak'}
                </p>
              </div>
            </div>
            {agent.config.parameters && (
              <div>
                <label className="text-xs text-slate-500 uppercase">Parameters</label>
                <pre className="mt-1 p-2 bg-slate-100 rounded text-xs text-slate-600 overflow-x-auto">
                  {JSON.stringify(agent.config.parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <label className="text-xs text-slate-500">Total Executions</label>
                <p className="text-xl font-bold text-slate-700">
                  {agent.metrics.totalExecutions.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <label className="text-xs text-slate-500">Success Rate</label>
                <p className="text-xl font-bold text-nu-green">
                  {agent.metrics.totalExecutions > 0
                    ? Math.round(
                        (agent.metrics.successfulExecutions /
                          agent.metrics.totalExecutions) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <label className="text-xs text-slate-500">Avg Confidence</label>
                <p className="text-xl font-bold text-slate-700">
                  {agent.metrics.averageConfidence.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <label className="text-xs text-slate-500">Avg Processing Time</label>
                <p className="text-xl font-bold text-slate-700">
                  {agent.metrics.averageProcessingTime}ms
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Successful</label>
                <p className="text-sm text-nu-green">
                  {agent.metrics.successfulExecutions.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Failed</label>
                <p className="text-sm text-danger-red">
                  {agent.metrics.failedExecutions.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            {agent.metrics.lastExecutedAt && (
              <div>
                <label className="text-xs text-slate-500 uppercase">Last Executed</label>
                <p className="text-sm text-slate-700">
                  {new Date(agent.metrics.lastExecutedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-2">
            {actions && actions.length > 0 ? (
              actions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      {action.action}
                    </span>
                    <Badge
                      variant={
                        action.status === 'success'
                          ? 'default'
                          : action.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {action.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(action.executedAt).toLocaleString('id-ID')}
                    {action.processingTime && ` • ${action.processingTime}ms`}
                    {action.confidence && ` • ${action.confidence}%`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                Tidak ada riwayat aksi
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-2">
            {errors && errors.length > 0 ? (
              errors.map((error) => (
                <div
                  key={error.id}
                  className="p-3 bg-danger-red/5 border border-danger-red/20 rounded-lg"
                >
                  <div className="font-medium text-danger-red">{error.error}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(error.occurredAt).toLocaleString('id-ID')}
                  </div>
                  {error.context && (
                    <pre className="mt-2 p-2 bg-white rounded text-xs text-slate-600 overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                Tidak ada riwayat error
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            {resources && resources.length > 0 ? (
              <div className="space-y-3">
                {resources.slice(-10).map((usage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">
                      {new Date(usage.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span>CPU</span>
                          <span>{usage.cpu.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, usage.cpu)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span>Memory</span>
                          <span>{usage.memory.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, usage.memory)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                Tidak ada data resource usage
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}