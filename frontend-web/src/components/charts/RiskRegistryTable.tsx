/**
 * RiskRegistryTable
 * Risk register display with mitigation status
 */

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Risk, RiskStatus, RiskCategory } from '@/services/riskRegistryService';
import {
  getRiskLevel,
  getRiskLevelColor,
  getRiskLevelBgColor,
  getLikelihoodLabel,
  getImpactLabel,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  formatRiskScore,
} from '@/services/riskRegistryService';

interface RiskRegistryTableProps {
  risks: Risk[];
  isLoading?: boolean;
  onRiskClick?: (risk: Risk) => void;
  showFilters?: boolean;
}

type SortField = 'title' | 'inherentRisk' | 'residualRisk' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export function RiskRegistryTable({
  risks,
  isLoading = false,
  onRiskClick,
  showFilters = true,
}: RiskRegistryTableProps) {
  const [sortField, setSortField] = useState<SortField>('inherentRisk');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<RiskStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | ''>('');

  // Filter and sort risks
  const filteredRisks = useMemo(() => {
    let result = [...risks];

    // Apply filters
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter((r) => r.category === categoryFilter);
    }

    // Apply sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;

      if (sortField === 'updatedAt') {
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [risks, statusFilter, categoryFilter, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Register Risiko
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Register Risiko
        </h3>
        <div className="text-sm text-slate-500">
          {filteredRisks.length} risiko
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RiskStatus | '')}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
          >
            <option value="">Semua Status</option>
            <option value="identified">Teridentifikasi</option>
            <option value="mitigating">Mitigasi</option>
            <option value="monitoring">Pemantauan</option>
            <option value="closed">Tertutup</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RiskCategory | '')}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
          >
            <option value="">Semua Kategori</option>
            <option value="operational">Operasional</option>
            <option value="financial">Keuangan</option>
            <option value="reputational">Reputasi</option>
            <option value="compliance">Kepatuhan</option>
            <option value="technical">Teknis</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1"
                >
                  Risiko
                  {sortField === 'title' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">
                Kategori
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                Likelihood
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                Impact
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                <button
                  onClick={() => handleSort('inherentRisk')}
                  className="flex items-center gap-1"
                >
                  Risiko Inheren
                  {sortField === 'inherentRisk' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                <button
                  onClick={() => handleSort('residualRisk')}
                  className="flex items-center gap-1"
                >
                  Risiko Residual
                  {sortField === 'residualRisk' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1"
                >
                  Status
                  {sortField === 'status' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-500">
                Progress
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-500">
                <button
                  onClick={() => handleSort('updatedAt')}
                  className="flex items-center gap-1"
                >
                  Diperbarui
                  {sortField === 'updatedAt' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRisks.map((risk) => {
              const level = getRiskLevel(risk.inherentRisk);
              return (
                <tr
                  key={risk.id}
                  onClick={() => onRiskClick?.(risk)}
                  className={cn(
                    'border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors'
                  )}
                >
                  <td className="py-3 px-2">
                    <div className="font-medium text-slate-700">
                      {risk.title}
                    </div>
                    <div className="text-sm text-slate-500 line-clamp-1">
                      {risk.description}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-slate-600">
                      {getCategoryLabel(risk.category)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm text-slate-600">
                      {getLikelihoodLabel(risk.likelihood)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm text-slate-600">
                      {getImpactLabel(risk.impact)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: getRiskLevelBgColor(level),
                        color: getRiskLevelColor(level),
                      }}
                    >
                      {formatRiskScore(risk.inherentRisk)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: getRiskLevelBgColor(getRiskLevel(risk.residualRisk)),
                        color: getRiskLevelColor(getRiskLevel(risk.residualRisk)),
                      }}
                    >
                      {formatRiskScore(risk.residualRisk)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(risk.status)}20`,
                        color: getStatusColor(risk.status),
                      }}
                    >
                      {getStatusLabel(risk.status)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {risk.mitigationProgress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-nu-green rounded-full"
                            style={{ width: `${risk.mitigationProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {risk.mitigationProgress}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-sm text-slate-500">
                    {formatDate(risk.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRisks.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          Tidak ada risiko
        </div>
      )}
    </div>
  );
}