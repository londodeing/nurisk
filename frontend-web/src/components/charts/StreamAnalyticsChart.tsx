/**
 * StreamAnalyticsChart
 * Real-time streaming data visualization
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
import { useMemo, useEffect, useState } from 'react';
import type { StreamDataPoint, WindowAggregate, ThresholdAlert } from '@/services/streamAnalyticsService';
import { formatStreamValue, getWindowLabel } from '@/services/streamAnalyticsService';

interface StreamAnalyticsChartProps {
  dataPoints: StreamDataPoint[];
  windowAggregates?: WindowAggregate[];
  thresholdAlerts?: ThresholdAlert[];
  runningTotal?: number;
  metric?: string;
  isLoading?: boolean;
  isConnected?: boolean;
  showThreshold?: boolean;
  autoRefresh?: boolean;
}

export function StreamAnalyticsChart({
  dataPoints,
  windowAggregates = [],
  thresholdAlerts = [],
  runningTotal = 0,
  metric = 'Insiden',
  isLoading = false,
  isConnected = false,
  showThreshold = true,
}: StreamAnalyticsChartProps) {
  const [now, setNow] = useState(Date.now());

  // Auto-refresh every second
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Get triggered alerts
  const triggeredAlerts = useMemo(
    () => thresholdAlerts.filter((a) => a.triggered),
    [thresholdAlerts]
  );

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Streaming {metric}
          </h3>
          <div className="w-3 h-3 bg-slate-300 rounded-full animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Streaming {metric}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-300 rounded-full" />
            <span className="text-sm text-slate-500">Offline</span>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-slate-500">
          Tidak ada data streaming
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            Streaming {metric}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="text-sm text-slate-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
            <span className="text-sm text-slate-400">•</span>
            <span className="text-sm text-slate-500">
              {formatTime(now)}
            </span>
          </div>
        </div>

        {/* Running Total */}
        <div className="text-right">
          <div className="text-sm text-slate-500">Total Kumulatif</div>
          <div className="text-2xl font-bold text-slate-700">
            {formatStreamValue(runningTotal)}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {triggeredAlerts.length > 0 && showThreshold && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">⚠️</span>
            <span className="font-medium">
              {triggeredAlerts.length} threshold(s) triggered
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPoints} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => formatTime(value)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => formatStreamValue(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => formatTime(value as number)}
              formatter={(value: number) => [formatStreamValue(value), 'Nilai']}
            />
            <Legend />

            {/* Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#0ea5e9' }}
              name="Nilai"
              isAnimationActive={false}
            />

            {/* Threshold Lines */}
            {showThreshold &&
              thresholdAlerts.map((alert) => (
                <ReferenceLine
                  key={alert.id}
                  y={alert.threshold}
                  stroke={alert.direction === 'above' ? '#dc2626' : '#f59e0b'}
                  strokeDasharray="5 5"
                  label={{
                    value: `${alert.threshold}`,
                    position: 'right',
                    fill: alert.direction === 'above' ? '#dc2626' : '#f59e0b',
                    fontSize: 10,
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Window Aggregates */}
      {windowAggregates.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {windowAggregates.map((agg) => (
            <div
              key={agg.window}
              className="p-3 bg-slate-50 rounded-lg"
            >
              <div className="text-sm text-slate-500">
                {getWindowLabel(agg.window)}
              </div>
              <div className="text-lg font-semibold text-slate-700">
                {formatStreamValue(agg.avg)}
              </div>
              <div className="text-xs text-slate-400">
                Rata-rata • {agg.count} data
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-sky-500" />
          <span className="text-slate-600">Streaming Data</span>
        </div>
        {showThreshold && triggeredAlerts.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-600 border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-slate-600">Threshold Alert</span>
          </div>
        )}
      </div>
    </div>
  );
}