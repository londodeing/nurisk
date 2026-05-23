import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Incident, PriorityLevel, IncidentStatus, DisasterType } from '@nurisk/shared-types/incident';

interface IncidentFeedProps {
  incidents: Incident[];
  loading?: boolean;
  error?: Error | null;
}

// Canonical severity styles
const severityStyles: Record<PriorityLevel, string> = {
  CRITICAL: 'bg-danger-red/10 border-l-danger-red text-danger-red',
  HIGH: 'bg-warning-yellow/10 border-l-warning-yellow text-warning-yellow',
  MEDIUM: 'bg-blue-500/10 border-l-blue-500 text-blue-500',
  LOW: 'bg-slate-100 border-l-slate-400 text-slate-500',
};

// Canonical status labels
const statusLabels: Record<IncidentStatus, string> = {
  REPORTED: 'Dilaporkan',
  ASSIGNED: 'Ditugaskan',
  IN_PROGRESS: 'Dalam Proses',
  RESOLVED: 'Diselesaikan',
  CLOSED: 'Ditutup',
};

// Canonical disaster type labels
const typeLabels: Record<DisasterType, string> = {
  BANJIR: 'Banjir',
  LONGSOR: 'Longsor',
  GEMPA: 'Gempa',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Erupsi',
  KEBAKARAN_HUTAN: 'Kebakaran Hutan',
  KEBAKARAN_BANGUNAN: 'Kebakaran Bangunan',
  EKSTREM_CUACA: 'Ekstrem Cuaca',
  WABAH_PENYAKIT: 'Wabah Penyakit',
};

export const IncidentFeed = memo(function IncidentFeed({ incidents, loading, error }: IncidentFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Kejadian Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 p-3">
                <div className="w-2 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Kejadian Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Gagal memuat kejadian</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Kejadian Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Tidak ada kejadian aktif</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j`;
    return `${Math.floor(hours / 24)}h`;
  };

  const sorted = [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-lg">Kejadian Terkini</CardTitle>
        <Badge variant={incidents.filter((i) => i.severity === 'CRITICAL').length > 0 ? 'destructive' : 'secondary'}>
          {incidents.length} aktif
        </Badge>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {sorted.map((incident) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors hover:bg-slate-50 ${
                severityStyles[incident.severity] || severityStyles.LOW
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {typeLabels[incident.type as DisasterType] || incident.type}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {statusLabels[incident.status] || incident.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{incident.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {incident.location.address ?? `${incident.location.lat}, ${incident.location.lng}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(incident.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default IncidentFeed;