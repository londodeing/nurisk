'use client';

import { useState, useMemo } from 'react';
import { WarningBanner } from './WarningBanner';
import {
  getWarningLevelLabel,
  type Warning,
} from '@/services/earlyWarningService';

interface WarningListProps {
  warnings: Warning[];
  onWarningClick?: (warning: Warning) => void;
  onDismiss?: (warningId: string) => void;
  showFilters?: boolean;
  showActiveOnly?: boolean;
}

export function WarningList({
  warnings,
  onWarningClick,
  onDismiss,
  showFilters = true,
  showActiveOnly = false,
}: WarningListProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWarnings = useMemo(() => {
    return warnings.filter((warning) => {
      if (showActiveOnly && warning.status !== 'ACTIVE') return false;

      if (selectedSeverity && warning.severity !== selectedSeverity) return false;

      if (selectedSource && warning.source !== selectedSource) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          warning.title.toLowerCase().includes(query) ||
          warning.description.toLowerCase().includes(query) ||
          warning.affectedAreas.some((area) =>
            area.toLowerCase().includes(query)
          )
        );
      }

      return true;
    });
  }, [warnings, showActiveOnly, selectedSeverity, selectedSource, searchQuery]);

  const sortedWarnings = useMemo(() => {
    return [...filteredWarnings].sort((a, b) => {
      const aActive = a.status === 'ACTIVE' ? 1 : 0;
      const bActive = b.status === 'ACTIVE' ? 1 : 0;
      if (aActive !== bActive) {
        return bActive - aActive;
      }
      const severityOrder: Record<string, number> = {
        EMERGENCY: 0,
        WARNING: 1,
        WATCH: 2,
        ADVISORY: 3,
        INFORMATIONAL: 4,
      };
      const aSeverityRank = severityOrder[a.severity] ?? 99;
      const bSeverityRank = severityOrder[b.severity] ?? 99;
      if (aSeverityRank !== bSeverityRank) {
        return aSeverityRank - bSeverityRank;
      }
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    });
  }, [filteredWarnings]);

  const clearFilters = () => {
    setSelectedSeverity('');
    setSelectedSource('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedSeverity || selectedSource || searchQuery;

  const severityOptions = ['EMERGENCY', 'WARNING', 'WATCH', 'ADVISORY', 'INFORMATIONAL'];
  const sourceOptions = ['BMKG', 'BNPB', 'weatherService', 'internal'];

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <input
              type="text"
              placeholder="Cari peringatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Level</option>
              {severityOptions.map((sev) => (
                <option key={sev} value={sev}>
                  {getWarningLevelLabel(sev as any)}
                </option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Sumber</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              🔄 Clear filters
            </button>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500">
        Menampilkan {sortedWarnings.length} dari {warnings.length} peringatan
        {showActiveOnly && ' aktif'}
      </div>

      <div className="space-y-3">
        {sortedWarnings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-2 text-gray-500">Tidak ada peringatan ditemukan</p>
          </div>
        ) : (
          sortedWarnings.map((warning) => (
            <WarningBanner
              key={warning.id}
              warning={warning}
              onClick={() => onWarningClick?.(warning)}
              onDismiss={() => onDismiss?.(warning.id)}
              autoDismiss={true}
              showCountdown={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default WarningList;
