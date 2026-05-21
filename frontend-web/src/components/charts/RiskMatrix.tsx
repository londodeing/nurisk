/**
 * RiskMatrix
 * Risk visualization (likelihood × impact)
 */

import { useMemo } from 'react';
import type { Risk, RiskMatrixCell, RiskLikelihood, RiskImpact } from '@/services/riskRegistryService';
import {
  getRiskLevel,
  getRiskLevelColor,
  getRiskLevelBgColor,
  getLikelihoodLabel,
  getImpactLabel,
} from '@/services/riskRegistryService';

interface RiskMatrixProps {
  risks: Risk[];
  isLoading?: boolean;
  onCellClick?: (likelihood: RiskLikelihood, impact: RiskImpact) => void;
}

export function RiskMatrix({ risks, isLoading = false, onCellClick }: RiskMatrixProps) {
  // Build matrix data
  const matrixData = useMemo(() => {
    const matrix: RiskMatrixCell[][] = [];

    // Create 5x5 matrix (likelihood × impact)
    for (let likelihood = 5; likelihood >= 1; likelihood--) {
      const row: RiskMatrixCell[] = [];
      for (let impact = 1; impact <= 5; impact++) {
        const cellRisks = risks.filter(
          (r) => r.likelihood === likelihood && r.impact === impact
        );
        row.push({
          likelihood: likelihood as RiskLikelihood,
          impact: impact as RiskImpact,
          risks: cellRisks,
          count: cellRisks.length,
        });
      }
      matrix.push(row);
    }

    return matrix;
  }, [risks]);

  // Get cell background color
  const getCellColor = (likelihood: RiskLikelihood, impact: RiskImpact) => {
    const score = likelihood * impact;
    const level = getRiskLevel(score);
    return getRiskLevelBgColor(level);
  };

  // Get cell border color
  const getCellBorderColor = (likelihood: RiskLikelihood, impact: RiskImpact) => {
    const score = likelihood * impact;
    const level = getRiskLevel(score);
    return getRiskLevelColor(level);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Matriks Risiko
        </h3>
        <div className="h-80 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Matriks Risiko
      </h3>

      {/* Y-axis label */}
      <div className="flex">
        <div className="w-12 flex items-center justify-center">
          <div className="text-xs text-slate-500 -rotate-90 whitespace-nowrap">
            Likelihood
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1">
          {/* Column headers (Impact) */}
          <div className="grid grid-cols-5 gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((impact) => (
              <div
                key={impact}
                className="text-center text-xs text-slate-500 py-1"
              >
                {getImpactLabel(impact as RiskImpact)}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {matrixData.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-1 mb-1">
              {/* Row header (Likelihood) */}
              <div className="flex items-center justify-center text-xs text-slate-500">
                {getLikelihoodLabel((5 - rowIndex) as RiskLikelihood)}
              </div>

              {/* Cells */}
              {row.map((cell, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() =>
                    onCellClick?.(cell.likelihood, cell.impact)
                  }
                  className="relative p-2 rounded-lg transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: getCellColor(cell.likelihood, cell.impact),
                    border: `2px solid ${getCellBorderColor(cell.likelihood, cell.impact)}`,
                  }}
                >
                  {cell.count > 0 && (
                    <div className="flex items-center justify-center">
                      <span
                        className="text-lg font-bold"
                        style={{
                          color: getCellBorderColor(cell.likelihood, cell.impact),
                        }}
                      >
                        {cell.count}
                      </span>
                    </div>
                  )}
                  {cell.count === 0 && (
                    <div className="text-xs text-slate-300">-</div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f0fdf4', border: '1px solid #16a34a' }} />
          <span className="text-sm text-slate-600">Rendah (1-7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b' }} />
          <span className="text-sm text-slate-600">Sedang (8-14)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #dc2626' }} />
          <span className="text-sm text-slate-600">Tinggi (15-25)</span>
        </div>
      </div>
    </div>
  );
}