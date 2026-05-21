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
// Mock Data (for development)
// ============================================

const MOCK_KPI = {
  totalIncidents: 156,
  activeIncidents: 23,
  totalVolunteers: 342,
  responseTimeAvg: 45,
  assessmentCompletionRate: 87,
  shelterCapacity: 78,
};

const MOCK_TREND = [
  { month: 'Jan', count: 45, resolved: 42 },
  { month: 'Feb', count: 52, resolved: 48 },
  { month: 'Mar', count: 38, resolved: 35 },
  { month: 'Apr', count: 61, resolved: 55 },
  { month: 'May', count: 55, resolved: 50 },
  { month: 'Jun', count: 48, resolved: 44 },
];

const MOCK_TYPE = [
  { name: 'Banjir', value: 45, color: '#16a34a' },
  { name: 'Tanah Longsor', value: 28, color: '#f59e0b' },
  { name: 'Gempa Bumi', value: 15, color: '#ef4444' },
  { name: 'Kebakaran', value: 8, color: '#ec4899' },
  { name: 'Badai', value: 4, color: '#3b82f6' },
];

const MOCK_REGION = [
  { region: 'Kota Surakarta', count: 42 },
  { region: 'Kab. Klaten', count: 35 },
  { region: 'Kab. Boyolali', count: 28 },
  { region: 'Kab. Sukoharjo', count: 22 },
  { region: 'Kab. Wonogiri', count: 18 },
  { region: 'Kab. Karanganyar', count: 11 },
];

const MOCK_RESPONSE_TIME = [
  { month: 'Jan', avgResponseTime: 52 },
  { month: 'Feb', avgResponseTime: 48 },
  { month: 'Mar', avgResponseTime: 45 },
  { month: 'Apr', avgResponseTime: 42 },
  { month: 'May', avgResponseTime: 38 },
  { month: 'Jun', avgResponseTime: 35 },
];

const MOCK_VOLUNTEER = [
  { date: '01', active: 120, missions: 45 },
  { date: '02', active: 135, missions: 52 },
  { date: '03', active: 128, missions: 48 },
  { date: '04', active: 142, missions: 55 },
  { date: '05', active: 155, missions: 62 },
  { date: '06', active: 148, missions: 58 },
  { date: '07', active: 162, missions: 65 },
];

const MOCK_RESOURCE = [
  { resource: 'Personel', used: 85, available: 100 },
  { resource: 'Kendaraan', used: 65, available: 80 },
  { resource: 'Peralatan', used: 72, available: 90 },
  { resource: 'Logistik', used: 58, available: 75 },
  { resource: 'Medis', used: 45, available: 60 },
  { resource: 'Komunikasi', used: 80, available: 100 },
];

// ============================================
// Page Component
// ============================================

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);

  // Try to fetch from API, fall back to mock data
  const { data, isLoading } = useAnalyticsSummary(filters);

  // Use API data or mock data
  const kpi = data?.kpi || MOCK_KPI;
  const incidentTrend = data?.incidentTrend || MOCK_TREND;
  const incidentByType = data?.incidentByType || MOCK_TYPE;
  const incidentByRegion = data?.incidentByRegion || MOCK_REGION;
  const responseTime = data?.responseTime || MOCK_RESPONSE_TIME;
  const volunteerActivity = data?.volunteerActivity || MOCK_VOLUNTEER;
  const resourceUtilization = data?.resourceUtilization || MOCK_RESOURCE;

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