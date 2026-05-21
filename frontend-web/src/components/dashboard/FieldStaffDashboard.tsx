import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, AlertTriangle, ClipboardCheck, Camera, 
  FileText, CheckCircle, WifiOff, RefreshCw,
  Building
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

// Types
interface AssignedIncident {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: string;
  status: string;
  assignedAt: string;
}

interface Assessment {
  id: string;
  incidentId: string;
  incidentTitle: string;
  type: 'building' | 'victim' | 'infrastructure';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface FieldStats {
  totalAssigned: number;
  pendingAssessments: number;
  completedToday: number;
  criticalIncidents: number;
}

// Quick Stats Component
function FieldQuickStats({ stats, loading }: { stats: FieldStats; loading: boolean }) {
  const statCards = [
    { label: 'Ditugaskan', value: stats.totalAssigned, icon: MapPin, color: 'text-blue-600' },
    { label: 'Assessment', value: stats.pendingAssessments, icon: ClipboardCheck, color: 'text-amber-600' },
    { label: 'Selesai Hari Ini', value: stats.completedToday, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Kritis', value: stats.criticalIncidents, icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statCards.map((stat, i) => (
        <Card key={i} className={loading ? 'opacity-50' : ''}>
          <CardContent className="p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Incident Radar Component
function IncidentRadar({ incidents, loading, onSelect }: { 
  incidents: AssignedIncident[]; 
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Incident Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500">
            Tidak ada incident ditugaskan
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-auto">
            {incidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => onSelect(incident.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left border"
              >
                <div className={`w-3 h-3 rounded-full ${severityColors[incident.severity as keyof typeof severityColors]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{incident.title}</p>
                  <p className="text-xs text-slate-500 truncate">{incident.location}</p>
                </div>
                <Badge variant={incident.status === 'active' ? 'default' : 'secondary'}>
                  {incident.status}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pending Assessments Component
function PendingAssessments({ assessments, loading, onStart }: {
  assessments: Assessment[];
  loading: boolean;
  onStart: (id: string) => void;
}) {
  const priorityColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50',
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Assessment Tertunda
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500">
            Tidak ada assessment tertunda
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-auto">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center gap-3 p-2 rounded-lg border"
              >
                <div className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[assessment.priority]}`}>
                  {assessment.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{assessment.incidentTitle}</p>
                  <p className="text-xs text-slate-500 capitalize">{assessment.type}</p>
                </div>
                <Button size="sm" onClick={() => onStart(assessment.id)}>
                  Mulai
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function FieldStaffDashboard() {
  const navigate = useNavigate();
  const [offline, setOffline] = useState(!navigator.onLine);
  
  // Fetch assigned incidents
  const { data: incidents = [], isLoading: incidentsLoading, refetch: refetchIncidents } = useQuery({
    queryKey: ['assigned-incidents'],
    queryFn: async () => {
      const res = await api.get('/incidents/assigned');
      return res.data.data || [];
    },
  });

  // Fetch pending assessments
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['pending-assessments'],
    queryFn: async () => {
      const res = await api.get('/assessments', { params: { status: 'pending' } });
      return res.data.data || [];
    },
  });

  // Calculate stats
  const stats: FieldStats = {
    totalAssigned: incidents.length,
    pendingAssessments: assessments.length,
    completedToday: 0, // Would come from API
    criticalIncidents: incidents.filter((i: AssignedIncident) => i.severity === 'CRITICAL').length,
  };

  // Handle offline status
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSelectIncident = useCallback((id: string) => {
    navigate(`/incidents/${id}`);
  }, [navigate]);

  const handleStartAssessment = useCallback((id: string) => {
    navigate(`/assessment/${id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Offline Banner */}
      {offline && (
        <div className="bg-amber-500 text-white p-2 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Offline Mode - Data akan disinkronkan saat online
        </div>
      )}

      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Dashboard Field Staff</h1>
            <p className="text-sm opacity-80">Pantau & tangani incident</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetchIncidents()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="sm">Profil</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-4">
        {/* Quick Stats */}
        <FieldQuickStats stats={stats} loading={incidentsLoading} />

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <IncidentRadar 
            incidents={incidents} 
            loading={incidentsLoading}
            onSelect={handleSelectIncident}
          />
          <PendingAssessments 
            assessments={assessments}
            loading={assessmentsLoading}
            onStart={handleStartAssessment}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/assessment/new">
            <Button className="w-full h-16 flex flex-col items-center gap-1">
              <Building className="w-5 h-5" />
              <span>Building Assessment</span>
            </Button>
          </Link>
          <Link to="/report/field">
            <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
              <FileText className="w-5 h-5" />
              <span>Laporan Lapangan</span>
            </Button>
          </Link>
          <Link to="/photo">
            <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
              <Camera className="w-5 h-5" />
              <span>Dokumentasi Foto</span>
            </Button>
          </Link>
          <Link to="/incidents/map">
            <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
              <MapPin className="w-5 h-5" />
              <span>Peta Incident</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}