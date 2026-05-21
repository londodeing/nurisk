/**
 * ProphetForecastChart
 * Time-series forecast with Prophet model visualization
 */

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceDot,
} from 'recharts';
import { useMemo } from 'react';
import type { ForecastDataPoint, AnomalyPoint } from '@/services/prophetService';
import { formatForecastValue, getConfidenceLabel } from '@/services/prophetService';

interface ProphetForecastChartProps {
  data: ForecastDataPoint[];
  anomalies?: AnomalyPoint[];
  metric?: string;
  isLoading?: boolean;
  showConfidenceInterval?: boolean;
  showSeasonal?: boolean;
}

export function ProphetForecastChart({
  data,
  anomalies = [],
  metric = 'Insiden',
  isLoading = false,
  showConfidenceInterval = true,
}: ProphetForecastChartProps) {
  // Merge anomalies into data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point) => {
      const anomaly = anomalies.find((a) => a.date === point.date);
      return {
        ...point,
        isAnomaly: anomaly?.anomaly ?? false,
      };
    });
  }, [data, anomalies]);

  // Calculate confidence level
  const confidenceLevel = useMemo(() => {
    if (!data || data.length === 0) return 'Unknown';
    const firstPoint = data[Math.floor(data.length / 2)];
    if (firstPoint) {
      return getConfidenceLabel(firstPoint.upper - firstPoint.lower);
    }
    return 'Unknown';
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Proyeksi {metric}
        </h3>
        <div className="h-80 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Proyeksi {metric}
        </h3>
        <div className="h-80 flex items-center justify-center text-slate-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Proyeksi {metric}
        </h3>
        <div className="text-sm text-slate-500">
          Confidence: {confidenceLevel}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => formatForecastValue(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                formatForecastValue(value),
                name,
              ]}
            />
            <Legend />

            {/* Confidence Interval Area */}
            {showConfidenceInterval && (
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#16a34a"
                fillOpacity={0.1}
                name="Upper Bound"
              />
            )}
            {showConfidenceInterval && (
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#fff"
                fillOpacity={1}
                name="Lower Bound"
              />
            )}

            {/* Historical Data Line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#16a34a' }}
              name="Aktual"
              connectNulls={false}
            />

            {/* Forecast Line (dashed) */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#6366f1', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#6366f1' }}
              name="Proyeksi"
            />

            {/* Anomaly Markers */}
            {chartData
              .filter((point) => point.isAnomaly)
              .map((point, index) => (
                <ReferenceDot
                  key={`anomaly-${index}`}
                  x={point.date}
                  y={point.actual}
                  r={8}
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-600" />
          <span className="text-slate-600">Data Aktual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-indigo-600 border-dashed" style={{ borderStyle: 'dashed' }} />
          <span className="text-slate-600">Proyeksi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full" />
          <span className="text-slate-600">Anomali</span>
        </div>
        {showConfidenceInterval && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100" />
            <span className="text-slate-600">Confidence Interval</span>
          </div>
        )}
      </div>
    </div>
  );
}