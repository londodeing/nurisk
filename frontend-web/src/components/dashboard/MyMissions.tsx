import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Mission } from '@nurisk/shared-types/mission';

interface MyMissionsProps {
  missions: Mission[];
  loading?: boolean;
  onView?: (missionId: string) => void;
  onUpdateStatus?: (missionId: string, status: string) => void;
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-600',
  COMPLETED: 'bg-green-100 text-green-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

const statusLabels: Record<string, string> = {
  PLANNED: 'Direncanakan',
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export function MyMissions({ missions, loading, onView, onUpdateStatus }: MyMissionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Misi Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 p-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
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

  if (missions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Misi Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <AlertTriangle size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Belum bergabung misi apapun</p>
            <p className="text-xs text-slate-400 mt-1">Gabung misi dari daftar di atas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j`;
    return `${Math.floor(hours / 24)}h`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Misi Saya</CardTitle>
          <Badge variant="secondary">{missions.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        {missions.map((mission) => {
          const canUpdate = !['COMPLETED', 'CANCELLED'].includes(mission.status);
          return (
            <div
              key={mission.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-nu-green/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                mission.priority === 'CRITICAL' ? 'bg-danger-red/10 text-danger-red' :
                mission.priority === 'HIGH' ? 'bg-warning-yellow/10 text-warning-yellow' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {mission.type?.charAt(0).toUpperCase() || 'M'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-medium text-sm truncate">{mission.name}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[mission.status] || ''}`}>
                    {statusLabels[mission.status] || mission.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {mission.location?.address ?? 'Lokasi tidak tersedia'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(mission.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onView?.(mission.id)}>
                    Detail <ChevronRight size={12} />
                  </Button>
                  {canUpdate && onUpdateStatus && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-nu-green hover:bg-nu-green/90"
                      onClick={() => onUpdateStatus(mission.id, mission.status)}
                    >
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default MyMissions;
