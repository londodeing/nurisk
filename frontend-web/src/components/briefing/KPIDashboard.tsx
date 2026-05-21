'use client';

import { Clock, CheckCircle, Users, Truck, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatResponseTime } from '@/services/briefingService';
import type { KeyMetrics } from '@/services/briefingService';

interface KPIDashboardProps {
  metrics: KeyMetrics;
  className?: string;
}

export function KPIDashboard({ metrics, className }: KPIDashboardProps) {
  // Calculate derived metrics
  const resolutionRate =
    metrics.totalIncidents > 0
      ? Math.round((metrics.resolvedIncidents / metrics.totalIncidents) * 100)
      : 0;
  const responseTrend = metrics.trend.response === 'improving' ? 'Membaik' : 'Stabil';
  const incidentTrend = metrics.trend.incidents === 'increasing' ? 'Naik' : 'Stabil';

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-700">Key Performance Indicators</h3>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total Incident"
          value={metrics.totalIncidents.toString()}
          subValue={`${metrics.activeIncidents} aktif`}
          icon={Activity}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Waktu Respons"
          value={formatResponseTime(metrics.avgResponseTime)}
          subValue={responseTrend}
          icon={Clock}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KPICard
          label="Tingkat Resolusi"
          value={`${resolutionRate}%`}
          subValue={`${metrics.resolvedIncidents}/${metrics.totalIncidents}`}
          icon={CheckCircle}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <KPICard
          label="Volunteer"
          value={metrics.volunteerCount.toString()}
          subValue={`${metrics.resourceUtilization}%`}
          icon={Users}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Resource"
          value={`${metrics.resourceUtilization}%`}
          subValue="terpakai"
          icon={Truck}
          color="text-slate-600"
          bgColor="bg-slate-50"
        />
        <KPICard
          label="Verifikasi"
          value={`${metrics.verificationRate}%`}
          subValue="laporan"
          icon={CheckCircle}
          color="text-cyan-600"
          bgColor="bg-cyan-50"
        />
        <KPICard
          label="Trend Incident"
          value={metrics.trend.incidents === 'increasing' ? 'Naik' : 'Stabil'}
          subValue={incidentTrend}
          icon={
            metrics.trend.incidents === 'increasing'
              ? TrendingUp
              : TrendingDown
          }
          color={
            metrics.trend.incidents === 'increasing'
              ? 'text-red-600'
              : 'text-green-600'
          }
          bgColor={
            metrics.trend.incidents === 'increasing'
              ? 'bg-red-50'
              : 'bg-green-50'
          }
        />
        <KPICard
          label="Incident Aktif"
          value={metrics.activeIncidents.toString()}
          subValue="belum selesai"
          icon={Activity}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface KPICardProps {
  label: string;
  value: string;
  subValue: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function KPICard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
  bgColor,
}: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg', bgColor)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-700">{value}</p>
      <p className="text-xs text-slate-400">{subValue}</p>
    </div>
  );
}

export default KPIDashboard;