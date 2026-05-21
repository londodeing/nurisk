'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BiasReport,
  getBiasSeverityColor,
  getBiasScoreColor,
} from '@/services/agentService';
import { useBiasReport, useBiasAlerts } from '@/hooks/use-agents';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BiasMonitorProps {
  initialReport?: BiasReport;
}

export function BiasMonitor({ initialReport }: BiasMonitorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'recommendations'>('overview');

  const { data: report } = useBiasReport(30);
  const { data: alerts } = useBiasAlerts(10);

  const biasReport = report || initialReport;

  // Prepare chart data
  const geographicData = biasReport
    ? Object.entries(biasReport.metrics.geographic.regionDistribution).map(([region, count]) => ({
        region,
        count,
        responseTime: biasReport.metrics.geographic.regionResponseTimes[region] || 0,
        accuracy: (biasReport.metrics.geographic.regionAccuracy[region] || 0) * 100,
      }))
    : [];

  const temporalData = biasReport
    ? Object.entries(biasReport.metrics.temporal.hourlyDistribution).map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
        responseTime: biasReport.metrics.temporal.responseTimeByHour[hour] || 0,
      }))
    : [];

  const trendData = [
    { day: 'Day 1', geographic: 35, demographic: 30, temporal: 28 },
    { day: 'Day 7', geographic: 40, demographic: 35, temporal: 32 },
    { day: 'Day 14', geographic: 38, demographic: 36, temporal: 30 },
    { day: 'Day 21', geographic: 42, demographic: 38, temporal: 35 },
    { day: 'Day 30', geographic: 42, demographic: 38, temporal: 35 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'recommendations', label: 'Recommendations' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-nu-green border-nu-green'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Bias Scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 uppercase">Geographic Bias</div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: getBiasScoreColor(biasReport?.metrics.geographic.biasScore || 0) }}
              >
                {biasReport?.metrics.geographic.biasScore || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Score (0-100)</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 uppercase">Demographic Bias</div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: getBiasScoreColor(biasReport?.metrics.demographic.biasScore || 0) }}
              >
                {biasReport?.metrics.demographic.biasScore || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Score (0-100)</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 uppercase">Temporal Bias</div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: getBiasScoreColor(biasReport?.metrics.temporal.biasScore || 0) }}
              >
                {biasReport?.metrics.temporal.biasScore || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Score (0-100)</div>
            </div>
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bias Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="geographic"
                      name="Geographic"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ fill: '#EF4444', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="demographic"
                      name="Demographic"
                      stroke="#F97316"
                      strokeWidth={2}
                      dot={{ fill: '#F97316', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temporal"
                      name="Temporal"
                      stroke="#EAB308"
                      strokeWidth={2}
                      dot={{ fill: '#EAB308', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regional Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geographicData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="region" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Incidents" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Temporal Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hourly Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={temporalData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {(alerts || biasReport?.alerts || []).map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-lg border"
              style={{
                borderColor: `${getBiasSeverityColor(alert.severity)}20`,
                backgroundColor: `${getBiasSeverityColor(alert.severity)}05`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getBiasSeverityColor(alert.severity) }}
                  />
                  <span className="font-medium text-slate-700">
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Bias
                  </span>
                </div>
                <Badge
                  variant={
                    alert.severity === 'CRITICAL'
                      ? 'destructive'
                      : alert.severity === 'HIGH'
                      ? 'commanded'
                      : alert.severity === 'MEDIUM'
                      ? 'assessment'
                      : 'secondary'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
              <div className="mt-2 text-xs text-slate-500">
                {new Date(alert.detectedAt).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
          {(!alerts || alerts.length === 0) && (!biasReport?.alerts || biasReport.alerts.length === 0) && (
            <div className="text-center text-slate-500 py-8">
              Tidak ada alerts
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {(biasReport?.recommendations || []).map((rec, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-nu-green text-white flex items-center justify-center text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            </div>
          ))}
          {(!biasReport?.recommendations || biasReport.recommendations.length === 0) && (
            <div className="text-center text-slate-500 py-8">
              Tidak ada rekomendasi
            </div>
          )}
        </div>
      )}
    </div>
  );
}