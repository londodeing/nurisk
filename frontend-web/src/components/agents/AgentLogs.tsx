'use client';

import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { Agent } from '@/services/agentService';
import { useAgentLogs } from '@/hooks/use-agents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentLogsProps {
  agents?: Agent[];
}

export function AgentLogs({ agents = [] }: AgentLogsProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [search, setSearch] = useState('');

  const { data: logs, isLoading, refetch } = useAgentLogs({
    agentId: selectedAgentId || undefined,
    level: levelFilter === 'all' ? undefined : levelFilter,
    search: search || undefined,
    limit: 100,
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs;
  }, [logs]);

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Agent', 'Level', 'Message'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.agentName,
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-500';
      case 'warn':
        return 'bg-warning-yellow';
      case 'error':
        return 'bg-danger-red';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Cari log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
        >
          <option value="">Semua Agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          {(['all', 'info', 'warn', 'error'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                levelFilter === level
                  ? 'bg-nu-green text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {level === 'all' ? 'Semua' : level.toUpperCase()}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Log Stream */}
      <div className="border border-slate-200 rounded-lg bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-medium text-slate-600">
            Real-time Logs ({filteredLogs.length})
          </span>
          <button
            onClick={() => refetch()}
            className="text-xs text-nu-green hover:underline"
          >
            Refresh
          </button>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-4 py-3 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${getLevelColor(
                        log.level
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {log.agentName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 break-words">
                        {log.message}
                      </p>
                      {log.details && (
                        <pre className="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-600 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Tidak ada log yang ditemukan
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}