'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Users,
  Clock,
  CheckCircle,
  Home,
  Activity,
} from 'lucide-react';

import { KpiCard } from '@/components/charts/KpiCard';
import { ChartFilters } from '@/components/charts/ChartFilters';
import { IncidentTrendChart } from '@/components/charts/IncidentTrendChart';
import { IncidentTypePie } from '@/components/charts/IncidentTypePie';
import { IncidentRegionBar } from '@/components/charts/IncidentRegionBar';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { VolunteerActivityChart } from '@/components/charts/VolunteerActivityChart';
import { ResourceRadarChart } from '@/components/charts/ResourceRadarChart';

import {
  useAnalyticsSummary,
  type AnalyticsFilters,
} from '@/hooks/use-analytics';

// ============================================
// Default Filters
// ============================================

const DEFAULT_FILTERS: AnalyticsFilters = {
  timeRange: '30d',
  region: '',
  incidentType: '',
};



// ============================================
// Page Component
// ============================================

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);

  // Try to fetch from API, fall back to mock data
  const { data, isLoading } = useAnalyticsSummary(filters);

  // Use API data or empty fallbacks
  const kpi = data?.kpi ?? { totalIncidents: 0, activeIncidents: 0, totalVolunteers: 0, responseTimeAvg: 0, assessmentCompletionRate: 0, shelterCapacity: 0 };
  const incidentTrend = data?.incidentTrend ?? [];
  const incidentByType = data?.incidentByType ?? [];
  const incidentByRegion = data?.incidentByRegion ?? [];
  const responseTime = data?.responseTime ?? [];
  const volunteerActivity = data?.volunteerActivity ?? [];
  const resourceUtilization = data?.resourceUtilization ?? [];

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau statistik dan tren penanganan bencana
          </p>
        </div>
      </div>

      {/* Filters */}
      <ChartFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Insiden"
          value={kpi.totalIncidents}
          change={12}
          changeLabel="vs last period"
          icon={AlertCircle}
          iconColor="text-nu-green"
          iconBgColor="bg-nu-green/10"
          isLoading={isLoading}
        />
        <KpiCard
          title="Insiden Aktif"
          value={kpi.activeIncidents}
          change={-5}
          changeLabel="vs last period"
          icon={Activity}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Relawan"
          value={kpi.totalVolunteers}
          change={8}
          changeLabel="vs last period"
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          isLoading={isLoading}
        />
        <KpiCard
          title="Waktu Tanggap"
          value={`${kpi.responseTimeAvg} m`}
          change={-15}
          changeLabel="vs last period"
          icon={Clock}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          isLoading={isLoading}
        />
        <KpiCard
          title="Assessment Rate"
          value={`${kpi.assessmentCompletionRate}%`}
          change={3}
          changeLabel="vs last period"
          icon={CheckCircle}
          iconColor="text-cyan-600"
          iconBgColor="bg-cyan-100"
          isLoading={isLoading}
        />
        <KpiCard
          title="Kapasitas Shelter"
          value={`${kpi.shelterCapacity}%`}
          change={-2}
          changeLabel="vs last period"
          icon={Home}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1: Trend + Type */}
        <IncidentTrendChart data={incidentTrend} isLoading={isLoading} />
        <IncidentTypePie data={incidentByType} isLoading={isLoading} />

        {/* Row 2: Region + Response Time */}
        <IncidentRegionBar data={incidentByRegion} isLoading={isLoading} />
        <ResponseTimeChart data={responseTime} isLoading={isLoading} />

        {/* Row 3: Volunteer + Resource */}
        <VolunteerActivityChart data={volunteerActivity} isLoading={isLoading} />
        <ResourceRadarChart data={resourceUtilization} isLoading={isLoading} />
      </div>
    </div>
  );
}