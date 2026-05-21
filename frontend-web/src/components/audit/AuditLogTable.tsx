'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  type AuditLogEntry,
  type AuditEntityType,
  getActionLabel,
  getEntityTypeLabel,
  getActionColor,
  getStatusColor,
} from '@/hooks/use-audit-log';

interface AuditLogTableProps {
  data: AuditLogEntry[];
  isLoading?: boolean;
  onRowClick?: (entry: AuditLogEntry) => void;
  selectedId?: number;
  className?: string;
}

export function AuditLogTable({
  data,
  isLoading,
  onRowClick,
  selectedId,
  className,
}: AuditLogTableProps) {
  const [sortField, setSortField] = useState<keyof AuditLogEntry>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof AuditLogEntry) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const comparison = aVal < bVal ? -1 : 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SortIcon = ({ field }: { field: keyof AuditLogEntry }) => (
    <span className={cn('ml-1', sortField === field ? 'text-gray-900' : 'text-gray-300')}>
      {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-100 border-b" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                Timestamp <SortIcon field="timestamp" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('actorName')}
              >
                User <SortIcon field="actorName" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('action')}
              >
                Action <SortIcon field="action" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('entityType')}
              >
                Entity <SortIcon field="entityType" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changes
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ipAddress')}
              >
                IP Address <SortIcon field="ipAddress" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data audit log
                </td>
              </tr>
            ) : (
              sortedData.map((entry) => (
                <tr
                  key={entry.id}
                  className={cn(
                    'hover:bg-gray-50 cursor-pointer transition-colors',
                    selectedId === entry.id && 'bg-blue-50',
                  )}
                  onClick={() => onRowClick?.(entry)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {entry.actorName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.actorName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.actorEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getActionColor(entry.action)}20`,
                        color: getActionColor(entry.action),
                      }}
                    >
                      {getActionLabel(entry.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {getEntityTypeLabel(entry.entityType as AuditEntityType)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    #{entry.entityId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                    {entry.changesSummary || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {entry.ipAddress || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      )}
                      style={{
                        backgroundColor: `${getStatusColor(entry.status)}20`,
                        color: getStatusColor(entry.status),
                      }}
                    >
                      {entry.status === 'success' ? '✓ Berhasil' : '✕ Gagal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard widgets
 */
export function AuditLogTableCompact({
  data,
  limit = 5,
  className,
}: {
  data: AuditLogEntry[];
  limit?: number;
  className?: string;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      <div className="divide-y divide-gray-200">
        {data.slice(0, limit).map((entry) => (
          <div
            key={entry.id}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {entry.actorName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {getActionLabel(entry.action)}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.actorName} • {entry.entityType}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {formatDate(entry.timestamp)}
              </div>
              <span
                className="text-xs"
                style={{ color: getStatusColor(entry.status) }}
              >
                {entry.status === 'success' ? '✓' : '✕'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditLogTable;