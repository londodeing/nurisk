'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  type AuditLogEntry,
  type AuditEntityType,
  getActionLabel,
  getEntityTypeLabel,
  getActionColor,
  getStatusColor,
} from '@/hooks/use-audit-log';

interface AuditDetailModalProps {
  entry: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({
  entry,
  isOpen,
  onClose,
}: AuditDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'before' | 'after'>('summary');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderValue = (value: unknown, indent = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    if (typeof value === 'object') {
      return (
        <pre
          className={cn('text-xs bg-gray-50 p-2 rounded overflow-x-auto')}
          style={{ marginLeft: indent * 16 }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Audit Log
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Timestamp</div>
                <div className="font-medium">{formatDate(entry.timestamp)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">User</div>
                <div className="font-medium">{entry.actorName || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{entry.actorEmail}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Aksi</div>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getActionColor(entry.action)}20`,
                    color: getActionColor(entry.action),
                  }}
                >
                  {getActionLabel(entry.action)}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Entity</div>
                <div className="font-medium">
                  {getEntityTypeLabel(entry.entityType as AuditEntityType)} #{entry.entityId}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">IP Address</div>
                <div className="font-medium">{entry.ipAddress || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(entry.status || 'failed')}20`,
                    color: getStatusColor(entry.status || 'failed'),
                  }}
                >
                  {entry.status === 'success' ? '✓ Berhasil' : '✕ Gagal'}
                </span>
              </div>
            </div>

            {/* Changes Summary */}
            {entry.changesSummary && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Ringkasan Perubahan</div>
                <div className="font-medium">{entry.changesSummary}</div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b mb-4">
              <nav className="-mb-px flex gap-4">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={cn(
                    'py-2 px-1 border-b-2 text-sm font-medium',
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700',
                  )}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('before')}
                  className={cn(
                    'py-2 px-1 border-b-2 text-sm font-medium',
                    activeTab === 'before'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700',
                  )}
                >
                  Sebelum
                </button>
                <button
                  onClick={() => setActiveTab('after')}
                  className={cn(
                    'py-2 px-1 border-b-2 text-sm font-medium',
                    activeTab === 'after'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700',
                  )}
                >
                  Sesudah
                </button>
              </nav>
            </div>

            {/* Values */}
            <div className="max-h-64 overflow-y-auto">
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {entry.beforeValue && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Nilai Sebelum:
                      </div>
                      {renderValue(entry.beforeValue)}
                    </div>
                  )}
                  {entry.afterValue && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Nilai Sesudah:
                      </div>
                      {renderValue(entry.afterValue)}
                    </div>
                  )}
                  {!entry.beforeValue && !entry.afterValue && (
                    <div className="text-gray-500 text-sm italic">
                      Tidak ada data perubahan detail
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'before' && (
                <div>
                  {entry.beforeValue ? (
                    renderValue(entry.beforeValue)
                  ) : (
                    <div className="text-gray-500 text-sm italic">
                      Tidak ada data sebelum
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'after' && (
                <div>
                  {entry.afterValue ? (
                    renderValue(entry.afterValue)
                  ) : (
                    <div className="text-gray-500 text-sm italic">
                      Tidak ada data sesudah
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple inline detail view
 */
export function AuditDetailInline({
  entry,
  className,
}: {
  entry: AuditLogEntry;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-lg shadow p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Detail Perubahan</h4>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${getStatusColor(entry.status || 'failed')}20`,
            color: getStatusColor(entry.status || 'failed'),
          }}
        >
          {entry.status === 'success' ? 'Berhasil' : 'Gagal'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Aksi</span>
          <span
            className="font-medium"
            style={{ color: getActionColor(entry.action) }}
          >
            {getActionLabel(entry.action)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Entity</span>
          <span className="font-medium">
            {getEntityTypeLabel(entry.entityType as AuditEntityType)} #{entry.entityId}
          </span>
        </div>
        {entry.changesSummary && (
          <div>
            <span className="text-gray-500">Perubahan</span>
            <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
              {entry.changesSummary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditDetailModal;