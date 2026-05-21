'use client';

import { useState } from 'react';
import { Bot, FileText, AlertTriangle } from 'lucide-react';
import { useAgents, useToggleAgent } from '@/hooks/use-agents';
import { MOCK_AGENTS, MOCK_BIAS_REPORT } from '@/services/agentService';
import { AgentList } from '@/components/agents/AgentList';
import { AgentLogs } from '@/components/agents/AgentLogs';
import { BiasMonitor } from '@/components/agents/BiasMonitor';

type TabId = 'agents' | 'logs' | 'bias';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('agents');

  // Use mock data for now - in production would use API
  const agents = MOCK_AGENTS;
  const biasReport = MOCK_BIAS_REPORT;

  const { data: agentsData, isLoading: agentsLoading } = useAgents();
  const toggleAgent = useToggleAgent();

  const tabs = [
    { id: 'agents' as const, label: 'Agents', icon: Bot, count: agents.length },
    { id: 'logs' as const, label: 'Logs', icon: FileText },
    { id: 'bias' as const, label: 'Bias Monitor', icon: AlertTriangle },
  ];

  const handleToggleAgent = async (id: string, enabled: boolean) => {
    try {
      await toggleAgent.mutateAsync({ id, enabled });
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nu-green/10 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-nu-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">AI Agents</h1>
            <p className="text-sm text-slate-500">
              Kelola dan monitor AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-nu-green border-nu-green'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'agents' && (
          <AgentList
            agents={agentsData || agents}
            isLoading={agentsLoading}
            onToggleAgent={handleToggleAgent}
          />
        )}

        {activeTab === 'logs' && (
          <AgentLogs agents={agentsData || agents} />
        )}

        {activeTab === 'bias' && (
          <BiasMonitor initialReport={biasReport} />
        )}
      </div>
    </div>
  );
}