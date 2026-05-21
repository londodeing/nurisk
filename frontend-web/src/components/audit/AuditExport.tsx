'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type AuditFilters, type AuditLogEntry } from '@/hooks/use-audit-log';

interface AuditExportProps {
  data: AuditLogEntry[];
  filters: AuditFilters;
  className?: string;
}

export function AuditExport({ data, className }: AuditExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // CSV headers
      const headers = [
        'ID',
        'Timestamp',
        'User Name',
        'User Email',
        'Action',
        'Entity Type',
        'Entity ID',
        'Changes Summary',
        'IP Address',
        'Status',
      ];

      // CSV rows
      const rows = data.map((entry) => [
        entry.id,
        entry.timestamp,
        entry.actorName || '',
        entry.actorEmail || '',
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.changesSummary || '',
        entry.ipAddress || '',
        entry.status,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(','),
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <button
        onClick={exportToCSV}
        disabled={isExporting || data.length === 0}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {isExporting ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <span>📄</span>
        )}
        Export CSV
      </button>

      <button
        onClick={exportToJSON}
        disabled={data.length === 0}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <span>📋</span>
        Export JSON
      </button>
    </div>
  );
}

/**
 * Export button with dropdown
 */
export function AuditExportDropdown({
  data,
  className,
}: AuditExportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = () => {
    setIsOpen(false);

    const headers = [
      'ID',
      'Timestamp',
      'User Name',
      'User Email',
      'Action',
      'Entity Type',
      'Entity ID',
      'Changes Summary',
      'IP Address',
      'Status',
    ];

    const rows = data.map((entry) => [
      entry.id,
      entry.timestamp,
      entry.actorName || '',
      entry.actorEmail || '',
      entry.action,
      entry.entityType,
      entry.entityId,
      entry.changesSummary || '',
      entry.ipAddress || '',
      entry.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    setIsOpen(false);

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
      >
        <span>📥</span>
        Export
        <span className="ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border z-10">
          <button
            onClick={exportToCSV}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-t-md"
          >
            📄 Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-b-md"
          >
            📋 Export JSON
          </button>
        </div>
      )}
    </div>
  );
}

export default AuditExport;