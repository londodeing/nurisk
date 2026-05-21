'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  type AuditFilters,
  type AuditAction,
  type AuditEntityType,
  type AuditStatus,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  getActionLabel,
  getEntityTypeLabel,
} from '@/hooks/use-audit-log';

interface AuditFiltersProps {
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  className?: string;
}

export function AuditFilters({
  filters,
  onFilterChange,
  className,
}: AuditFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = <K extends keyof AuditFilters>(
    key: K,
    value: AuditFilters[K],
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: AuditFilters = {};
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v !== undefined && v !== '',
  );

  return (
    <div className={cn('bg-white rounded-lg shadow p-4', className)}>
      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pencarian
        </label>
        <input
          type="text"
          placeholder="Cari berdasarkan ID entity atau nama user..."
          value={localFilters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aksi
          </label>
          <select
            value={localFilters.action || ''}
            onChange={(e) =>
              updateFilter('action', (e.target.value as AuditAction) || undefined)
            }
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Aksi</option>
            {AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity
          </label>
          <select
            value={localFilters.entityType || ''}
            onChange={(e) =>
              updateFilter(
                'entityType',
                (e.target.value as AuditEntityType) || undefined,
              )
            }
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Entity</option>
            {AUDIT_ENTITY_TYPES.map((entity) => (
              <option key={entity} value={entity}>
                {getEntityTypeLabel(entity)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) =>
              updateFilter(
                'status',
                (e.target.value as AuditStatus) || undefined,
              )
            }
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="failed">Gagal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="number"
            placeholder="ID User"
            value={localFilters.actorId || ''}
            onChange={(e) =>
              updateFilter(
                'actorId',
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
      >
        {showAdvanced ? '▼' : '▶'} Filter Tanggal
      </button>

      {/* Date Range */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Hapus Filter
        </button>
      )}
    </div>
  );
}

/**
 * Compact filters for dashboard widgets
 */
export function AuditFiltersCompact({
  filters,
  onFilterChange,
  className,
}: {
  filters: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      <select
        value={filters.action || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            action: (e.target.value as AuditAction) || undefined,
          })
        }
        className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Aksi</option>
        {AUDIT_ACTIONS.slice(0, 5).map((action) => (
          <option key={action} value={action}>
            {getActionLabel(action)}
          </option>
        ))}
      </select>

      <select
        value={filters.entityType || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            entityType: (e.target.value as AuditEntityType) || undefined,
          })
        }
        className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Entity</option>
        {AUDIT_ENTITY_TYPES.map((entity) => (
          <option key={entity} value={entity}>
            {getEntityTypeLabel(entity)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AuditFilters;