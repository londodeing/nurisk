import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Users, MapPin, Activity, Radio,
  Plus, MessageSquare, RefreshCw, Clock,
  XCircle, ArrowRight, Truck, Shield
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';
import type { Incident, PriorityLevel, IncidentStatus } from '@nurisk/shared-types/incident';

// Types
interface KpiData {
  activeIncidents: number;
  totalVolunteers: number;
  pendingAssessments: number;
  criticalIncidents: number;
  verifiedIncidents: number;
  completedToday: number;
}

interface Activity {
  id: string;
  type?: string;
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'critical';
}

// KPI Cards Component - MUST show fallback for unavailable data
function KpiCards({ data, loading, error }: { data: KpiData; loading: boolean; error?: boolean }) {
  const cards = [
    { label: 'Active Incidents', value: data.activeIncidents, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Volunteers', value: data.totalVolunteers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: data.pendingAssessments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Critical', value: data.criticalIncidents, icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className={`${loading ? 'opacity-50' : ''} ${error ? 'border-red-500 border-2' : ''} ${card.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase">{card.label}</p>
                {/* Use "Unavailable" instead of 0 when error */}
                <p className="text-3xl font-bold">{error ? 'Unavailable' : card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Activity Feed Component
function ActivityFeed({ activities, loading }: { activities: Activity[]; loading: boolean }) {
  const severityStyles = {
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500',
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-time Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-2 rounded border-l-4 bg-slate-50 ${severityStyles[activity.severity || 'info']}`}
              >
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-slate-500">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions({ onCreateIncident, onBroadcast, onDispatch }: {
  onCreateIncident: () => void;
  onBroadcast: () => void;
  onDispatch: () => void;
}) {
  const actions = [
    { label: 'Create Incident', icon: Plus, onClick: onCreateIncident, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Broadcast Alert', icon: MessageSquare, onClick: onBroadcast, color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Dispatch Team', icon: Truck, onClick: onDispatch, color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, i) => (
          <Button
            key={i}
            onClick={action.onClick}
            className={`w-full ${action.color} text-white`}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// Mini Map Component
function MiniMap({ incidents }: { incidents: Incident[] }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Map Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-slate-100 rounded flex items-center justify-center relative overflow-hidden">
          {/* Simplified map representation */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-300 via-slate-100 to-slate-50" />
          </div>
          {incidents.slice(0, 10).map((incident, i) => (
            <div
              key={incident.id}
              className={`absolute w-3 h-3 rounded-full ${
                incident.severity === 'CRITICAL' ? 'bg-red-500' :
                incident.severity === 'HIGH' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}
              style={{
                left: `${20 + (i * 7)}%`,
                top: `${20 + (i * 5)}%`,
              }}
              title={incident.title}
            />
          ))}
          <div className="absolute bottom-2 right-2 text-xs text-slate-500">
            {incidents.length} incidents
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Incidents Table
function RecentIncidentsTable({ incidents, loading, onView }: {
  incidents: Incident[];
  loading: boolean;
  onView: (id: string) => void;
}) {
  const severityColors: Record<PriorityLevel, string> = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-green-100 text-green-700',
  };

  const statusLabels: Record<IncidentStatus, string> = {
    REPORTED: 'Dilaporkan',
    ASSIGNED: 'Ditugaskan',
    IN_PROGRESS: 'Dalam Proses',
    RESOLVED: 'Diselesaikan',
    CLOSED: 'Ditutup',
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Recent Incidents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs text-slate-500">Title</th>
                  <th className="text-left p-2 text-xs text-slate-500">Location</th>
                  <th className="text-left p-2 text-xs text-slate-500">Severity</th>
                  <th className="text-left p-2 text-xs text-slate-500">Status</th>
                  <th className="text-left p-2 text-xs text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 5).map((incident) => (
                  <tr key={incident.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-sm">{incident.title}</td>
                    <td className="p-2 text-sm truncate max-w-[150px]">{incident.location.address ?? `${incident.location.lat}, ${incident.location.lng}`}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${severityColors[incident.severity]}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-2 text-sm">{statusLabels[incident.status]}</td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" onClick={() => onView(incident.id)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Emergency Banner
function EmergencyBanner({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null;

  return (
    <div className="bg-red-600 text-white p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
        <span className="font-bold">EMERGENCY: {message}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onDismiss} className="text-white hover:bg-red-700">
        <XCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Main Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { socket } = useSocket();
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch KPI data - MUST expose isError for observability
  const { data: kpiData, isLoading: kpiLoading, isError: kpiError, refetch: refetchKpi } = useQuery({
    queryKey: ['admin-kpi'],
    queryFn: async () => {
      const [incidentsRes, volunteersRes, assessmentsRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/volunteers'),
        api.get('/assessments', { params: { status: 'pending' } }),
      ]);
      const incidents = incidentsRes.data.data || [];
      return {
        activeIncidents: incidents.filter((i: Incident) => i.status === 'REPORTED').length,
        totalVolunteers: (volunteersRes.data.data || []).length,
        pendingAssessments: (assessmentsRes.data.data || []).length,
        criticalIncidents: incidents.filter((i: Incident) => i.severity === 'CRITICAL').length,
        verifiedIncidents: incidents.filter((i: Incident) => i.status === 'ASSIGNED').length,
        completedToday: incidents.filter((i: Incident) => i.status === 'CLOSED').length,
      };
    },
  });

  // Fetch recent incidents - MUST expose isError for observability
  const { data: incidents = [], isLoading: incidentsLoading, isError: incidentsError, refetch: refetchIncidents } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents', { params: { limit: 10 } });
      return res.data.data || [];
    },
  });

  // Broadcast mutation
  const broadcast = useMutation({
    mutationFn: async (message: string) => {
      await api.post('/broadcast', { message });
    },
    onSuccess: () => {
      toast({ title: 'Broadcast sent', variant: 'success' });
    },
    onError: () => {
      toast({ title: 'Failed to broadcast', variant: 'destructive' });
    },
  });

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('incident:new', (incident: Incident) => {
      const newActivity: Activity = {
        id: incident.id,
        type: 'incident',
        message: `New incident: ${incident.title}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        severity: incident.severity === 'CRITICAL' ? 'critical' : 'info',
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
      refetchKpi();
      refetchIncidents();
    });

    socket.on('alert:emergency', (data: { message: string }) => {
      setEmergencyMessage(data.message);
    });

    return () => {
      socket.off('incident:new');
      socket.off('alert:emergency');
    };
  }, [socket, refetchKpi, refetchIncidents]);

  const handleCreateIncident = useCallback(() => {
    navigate('/incidents/new');
  }, [navigate]);

  const handleBroadcast = useCallback(() => {
    const message = prompt('Enter broadcast message:');
    if (message) {
      broadcast.mutate(message);
    }
  }, [broadcast]);

  const handleDispatch = useCallback(() => {
    navigate('/command-center');
  }, [navigate]);

  const handleViewIncident = useCallback((id: string) => {
    navigate(`/incidents/${id}`);
  }, [navigate]);

  const defaultKpi: KpiData = {
    activeIncidents: 0,
    totalVolunteers: 0,
    pendingAssessments: 0,
    criticalIncidents: 0,
    verifiedIncidents: 0,
    completedToday: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Emergency Banner */}
      <EmergencyBanner 
        message={emergencyMessage} 
        onDismiss={() => setEmergencyMessage(null)} 
      />

      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Command Center HUD</h1>
            <p className="text-sm opacity-80">Real-time disaster monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { refetchKpi(); refetchIncidents(); }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to="/admin/ics">
              <Button variant="ghost" size="sm">ICS</Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="ghost" size="sm">Analytics</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-4">
        {/* KPI Cards */}
        <KpiCards data={kpiData || defaultKpi} loading={kpiLoading} error={kpiError} />

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <ActivityFeed activities={activities} loading={false} />
          <QuickActions
            onCreateIncident={handleCreateIncident}
            onBroadcast={handleBroadcast}
            onDispatch={handleDispatch}
          />
          <MiniMap incidents={incidents} />
        </div>

        {/* Recent Incidents */}
        <RecentIncidentsTable
          incidents={incidents}
          loading={incidentsLoading}
          onView={handleViewIncident}
        />
      </main>
    </div>
  );
}