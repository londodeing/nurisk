/**
 * TrendAnalysisChart
 * Multi-metric trend analysis with period comparison
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useMemo } from 'react';
import type {
  TrendDataPoint,
  PeriodComparisonResult,
  MovingAverageData,
  ChangePoint,
} from '@/services/trendAnalysisService';
import { formatChange, getTrendIcon, getTrendColor } from '@/services/trendAnalysisService';

interface TrendAnalysisChartProps {
  data: TrendDataPoint[];
  movingAverages?: MovingAverageData[];
  periodComparison?: PeriodComparisonResult;
  changePoints?: ChangePoint[];
  metric?: string;
  isLoading?: boolean;
  showMovingAverage?: boolean;
  showChangePoints?: boolean;
}

export function TrendAnalysisChart({
  data,
  movingAverages = [],
  periodComparison,
  changePoints = [],
  metric = 'Insiden',
  isLoading = false,
  showMovingAverage = true,
  showChangePoints = true,
}: TrendAnalysisChartProps) {
  // Merge moving average into data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point, index) => ({
      ...point,
      movingAverage: movingAverages[index]?.movingAverage ?? 0,
    }));
  }, [data, movingAverages]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Analisis Tren {metric}
        </h3>
        <div className="h-80 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Analisis Tren {metric}
        </h3>
        <div className="h-80 flex items-center justify-center text-slate-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Period Comparison Header */}
      {periodComparison && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Analisis Tren {metric}
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-500">Periode Sekarang</div>
              <div className="text-lg font-semibold text-slate-700">
                {periodComparison.current.toLocaleString('id-ID')}
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-lg"
              style={{
                backgroundColor: `${getTrendColor(periodComparison.trend)}20`,
                color: getTrendColor(periodComparison.trend),
              }}
            >
              <div className="text-2xl font-bold">
                {getTrendIcon(periodComparison.trend)}
              </div>
              <div className="text-xs">
                {formatChange(periodComparison.change, periodComparison.changePercent)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />

            {/* Main Value Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: '#16a34a', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#16a34a' }}
              name="Nilai"
            />

            {/* Previous Period Line */}
            {periodComparison && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                name="Periode Sebelumnya"
              />
            )}

            {/* Moving Average Line */}
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Moving Average"
              />
            )}

            {/* Change Point Markers */}
            {showChangePoints &&
              changePoints.map((point, index) => (
                <ReferenceLine
                  key={`change-${index}`}
                  x={point.date}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  label={{
                    value: point.type,
                    position: 'top',
                    fill: '#dc2626',
                    fontSize: 10,
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-600" />
          <span className="text-slate-600">Nilai Saat Ini</span>
        </div>
        {periodComparison && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-slate-400 border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-slate-600">Periode Sebelumnya</span>
          </div>
        )}
        {showMovingAverage && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-500 border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-slate-600">Moving Average</span>
          </div>
        )}
        {showChangePoints && (
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-3 bg-red-600 border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-slate-600">Change Point</span>
          </div>
        )}
      </div>
    </div>
  );
}