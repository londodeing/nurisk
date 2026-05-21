'use client';

import { useState } from 'react';
import { Agent, getAgentStatusColor, getAgentStatusLabel, getAgentTypeLabel, formatUptime } from '@/services/agentService';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AgentDetail } from './AgentDetail';

interface AgentListProps {
  agents: Agent[];
  isLoading?: boolean;
  onToggleAgent?: (id: string, enabled: boolean) => Promise<void>;
}

export function AgentList({ agents, isLoading, onToggleAgent }: AgentListProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = async (agent: Agent) => {
    if (onToggleAgent) {
      await onToggleAgent(agent.id, !agent.config.enabled);
    }
  };

  const handleViewDetail = (agent: Agent) => {
    setSelectedAgent(agent);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-100 border-b border-slate-200" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-100 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Task Saat Ini
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Uptime
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aktif
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-700">{agent.name}</div>
                    <div className="text-xs text-slate-500">{getAgentTypeLabel(agent.type)}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getAgentStatusColor(agent.status) }}
                    />
                    <span className="text-sm text-slate-600">
                      {getAgentStatusLabel(agent.status)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600 truncate max-w-[200px] block">
                    {agent.currentTask || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">
                    {formatUptime(agent.uptime)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">
                    {agent.actionsCount.toLocaleString('id-ID')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={agent.config.enabled}
                    onCheckedChange={() => handleToggle(agent)}
                    disabled={!onToggleAgent}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(agent)}
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {agents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Tidak ada agent yang ditemukan
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <AgentDetail agent={selectedAgent} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}