import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Users, 
  Clock, Download, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '@/services/api';

interface KpiCard {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ElementType;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function KpiDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);

  const { data: kpiData } = useQuery({
    queryKey: ['kpi-dashboard', dateRange],
    queryFn: async () => {
      const res = await api.get(`/analytics/kpi?range=${dateRange}`);
      return res.data;
    },
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ['kpi-charts', dateRange],
    queryFn: async () => {
      const res = await api.get(`/analytics/charts?range=${dateRange}`);
      return res.data;
    },
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const res = await api.get(`/analytics/export?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `kpi-report.${format}`;
      link.click();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const kpis: KpiCard[] = [
    { 
      title: 'Total Incidents', 
      value: kpiData?.totalIncidents || 0, 
      change: kpiData?.incidentsChange,
      trend: kpiData?.incidentsChange > 0 ? 'up' : 'down',
      icon: AlertTriangle 
    },
    { 
      title: 'Active Volunteers', 
      value: kpiData?.activeVolunteers || 0, 
      change: kpiData?.volunteersChange,
      trend: kpiData?.volunteersChange > 0 ? 'up' : 'down',
      icon: Users 
    },
    { 
      title: 'Reports Filed', 
      value: kpiData?.reportsFiled || 0, 
      change: kpiData?.reportsChange,
      trend: kpiData?.reportsChange > 0 ? 'up' : 'down',
      icon: FileText 
    },
    { 
      title: 'Avg Response Time', 
      value: `${kpiData?.avgResponseTime || 0}m`, 
      change: kpiData?.responseTimeChange,
      trend: kpiData?.responseTimeChange < 0 ? 'up' : 'down',
      icon: Clock 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-slate-500">Overview of system performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 mt-1 ${
                      (kpi.trend === 'up' && kpi.title !== 'Avg Response Time') ||
                      (kpi.trend === 'up' && kpi.title === 'Avg Response Time')
                        ? 'text-safe-green' : 'text-danger-red'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm">{Math.abs(kpi.change)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <kpi.icon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Incident Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.incidentTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.incidentByType || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {(chartData.incidentByType || []).map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volunteer Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.volunteerActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#3b82f6" />
                <Bar dataKey="new" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.responseTimeTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}