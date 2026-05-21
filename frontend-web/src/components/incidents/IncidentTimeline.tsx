import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertTriangle, FileText,
  ArrowLeft, User, MessageSquare, Image
} from 'lucide-react';
import { useIncident } from '@/features/incidents/hooks/useIncident';
import { useIncidentTimeline } from '@/features/incidents/hooks/useIncidentTimeline';
import type { IncidentStatus } from '@nurisk/shared-types/incident';

import { IncidentStatusBadge } from './IncidentStatusBadge';

// Timeline event type
interface TimelineEvent {
  id: string;
  type: 'status_change' | 'comment' | 'photo' | 'assignment' | 'assessment';
  title: string;
  description?: string;
  user?: string;
  timestamp: string;
  data?: any;
}

// Canonical status flow: REPORTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
const statusFlow: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'REPORTED', label: 'Dilaporkan', color: 'red' },
  { value: 'ASSIGNED', label: 'Ditugaskan', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Sedang Berlangsung', color: 'amber' },
  { value: 'RESOLVED', label: 'Terselesaikan', color: 'green' },
  { value: 'CLOSED', label: 'Ditutup', color: 'slate' },
];

const eventIcons = {
  status_change: CheckCircle,
  comment: MessageSquare,
  photo: Image,
  assignment: User,
  assessment: FileText,
};

const eventColors = {
  status_change: 'border-blue-500 bg-blue-50',
  comment: 'border-slate-500 bg-slate-50',
  photo: 'border-purple-500 bg-purple-50',
  assignment: 'border-green-500 bg-green-50',
  assessment: 'border-amber-500 bg-amber-50',
};

export function IncidentTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch incident
  const { data: incident, isLoading } = useIncident(id);
  const { data: timelineEvents = [] } = useIncidentTimeline(id);

  // Build timeline from canonical status flow
  const buildTimeline = (): TimelineEvent[] => {
    if (!incident?.status) return [];
    
    const timeline: TimelineEvent[] = [];
    const currentIndex = statusFlow.findIndex(s => s.value === incident?.status);
    
    for (let i = 0; i <= currentIndex; i++) {
      const statusItem = statusFlow[i];
      if (!statusItem) continue;
      timeline.push({
        id: `status-${i}`,
        type: 'status_change',
        title: statusItem.label,
        timestamp: incident?.createdAt || new Date().toISOString(),
        user: 'System',
      });
    }
    
    // Add any additional events from API
    if (timelineEvents) {
      timeline.push(...timelineEvents.map((e) => ({
        id: e.id,
        type: 'status_change' as const,
        title: e.title,
        description: e.description,
        user: e.performedByName,
        timestamp: e.createdAt,
        data: e,
      })));
    }
    
    return timeline;
  };

  const timeline = buildTimeline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-nu-green border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <p>Incident tidak ditemukan</p>
        <Button className="mt-4" onClick={() => navigate('/incidents')}>
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/incidents/${id}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Timeline</h1>
              <p className="text-sm opacity-80">{incident.title}</p>
            </div>
          </div>
          <IncidentStatusBadge status={incident?.status} severity={incident.severity} />
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Status Flow Visual */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto">
              {statusFlow.map((status, index) => {
                const currentIndex = statusFlow.findIndex(s => s.value === incident?.status);
                const isActive = index === currentIndex;
                const isPast = index < currentIndex;
                
                return (
                  <div key={status.value} className="flex items-center">
                    <div className={`flex flex-col items-center p-2 rounded ${
                      isActive
                        ? 'bg-nu-green text-white'
                        : isPast
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPast ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isActive ? (
                        <Clock className="w-5 h-5 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                      <span className="text-xs mt-1">{status.label}</span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div className={`w-6 sm:w-12 h-0.5 mx-1 ${
                        isPast ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                
                <div className="space-y-4">
                  {timeline.map((event, index) => {
                    const Icon = eventIcons[event.type] || Clock;
                    const colorClass = eventColors[event.type] || 'border-slate-500';
                    
                    return (
                      <div key={event.id} className="relative flex gap-3">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${colorClass} border-2`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.timestamp).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                            {event.user && (
                              <>
                                <span>•</span>
                                <User className="w-3 h-3" />
                                <span>{event.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence Documents */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dokumen Bukti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada dokumen</p>
              <Button variant="outline" className="mt-2">
                Upload Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default IncidentTimeline;