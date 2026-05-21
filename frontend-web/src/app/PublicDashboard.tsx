import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Home, RefreshCw } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { DisasterAlertList } from '@/components/dashboard/DisasterAlertCard';
import { IncidentTrendChart } from '@/components/dashboard/IncidentTrendChart';
import { useIncidents } from '@/hooks/use-incidents';
import api from '@/services/api';

export default function PublicDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  const { data: incidentsData, isLoading, refetch } = useIncidents({ status: 'active' });
  const [stats, setStats] = useState({
    activeIncidents: 0,
    volunteers: 0,
    shelters: 0,
  });
  const [alerts, setAlerts] = useState([]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Stats fetch error:', error);
      }
    }
    fetchStats();
  }, []);

  // Fetch alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await api.get('/incidents?severity=critical,high&limit=5');
        setAlerts(res.data.data || []);
      } catch (error) {
        console.error('Alerts fetch error:', error);
      }
    }
    fetchAlerts();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">NU PEDULI Jawa Tengah</h1>
          <nav className="flex gap-4">
            <Link to="/map" className="hover:underline">Peta</Link>
            <Link to="/report" className="hover:underline">Lapor</Link>
            <Link to="/login" className="hover:underline">Masuk</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 space-y-6">
        {/* Auto-refresh toggle */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="rounded border p-1 text-sm"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            )}
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="Laporan Aktif"
            value={stats.activeIncidents}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
            to="/incidents?status=active"
          />
          <KpiCard
            title="Relawan Aktif"
            value={stats.volunteers}
            icon={<Users className="w-6 h-6" />}
            variant="success"
            to="/volunteers"
          />
          <KpiCard
            title="Posko Evakuasi"
            value={stats.shelters}
            icon={<Home className="w-6 h-6" />}
            to="/shelters"
          />
          <KpiCard
            title="Total Kejadian"
            value={incidentsData?.total || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts & Weather */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Peringatan Terbaru</CardTitle>
                  <Badge variant="destructive">{alerts.length} aktif</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DisasterAlertList alerts={alerts} onDismiss={handleDismissAlert} />
              </CardContent>
            </Card>

            {/* Trend Chart */}
            <IncidentTrendChart />
          </div>

          {/* Right Column - Weather & Map Preview */}
          <div className="space-y-6">
            <WeatherWidget />

            {/* Map Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Peta Wilayah</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/map">
                  <div className="h-48 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors">
                    <span className="text-slate-500">Klik untuk melihat peta lengkap</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hero CTA */}
        <section className="bg-nu-green text-white py-12 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Sistem Tanggap Bencana</h2>
            <p className="text-lg mb-6">NU PEDULI Jawa Tengah</p>
            <div className="flex justify-center gap-4">
              <Link to="/report">
                <Button variant="emergency" size="lg">LAPOR BENCANA</Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" size="lg" className="bg-white text-nu-green">
                  LIHAT PETA
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}