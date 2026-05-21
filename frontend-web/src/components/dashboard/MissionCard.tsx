import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import type { Mission } from '@nurisk/shared-types/mission';

interface MissionCardProps {
  mission: Mission;
  joined?: boolean;
  onJoin?: (missionId: string) => void;
  onView?: (missionId: string) => void;
  loading?: boolean;
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-danger-red text-white',
  HIGH: 'bg-warning-yellow text-white',
  MEDIUM: 'bg-blue-500 text-white',
  LOW: 'bg-slate-400 text-white',
};

const priorityLabels: Record<string, string> = {
  CRITICAL: 'KRITIS',
  HIGH: 'TINGGI',
  MEDIUM: 'MENENGAH',
  LOW: 'RENDAH',
};

const statusLabels: Record<string, string> = {
  PLANNED: 'Direncanakan',
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export function MissionCard({ mission, joined, onJoin, onView, loading }: MissionCardProps) {
  const spotsLeft = (mission.volunteersNeeded ?? 0) - (mission.volunteersJoined ?? 0);
  const timeAgo = getTimeAgo(mission.createdAt);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-1.5 h-full min-h-[80px] rounded-full shrink-0 ${
            mission.priority === 'CRITICAL' ? 'bg-danger-red' :
            mission.priority === 'HIGH' ? 'bg-warning-yellow' :
            mission.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
          }`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={priorityColors[mission.priority] || priorityColors.LOW}>
                {priorityLabels[mission.priority] || mission.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {statusLabels[mission.status] || mission.status}
              </Badge>
            </div>

            <h3 className="font-semibold text-sm mb-0.5 line-clamp-1">{mission.name}</h3>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{mission.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {mission.location?.address ?? 'Lokasi tidak tersedia'}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {mission.volunteersJoined ?? 0}/{mission.volunteersNeeded ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeAgo}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={() => onView(mission.id)}>
                  Detail
                </Button>
              )}
              {joined ? (
                <Badge variant="secondary" className="text-xs">Joined</Badge>
              ) : (
                <Button
                  variant={spotsLeft > 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onJoin?.(mission.id)}
                  disabled={spotsLeft <= 0 || loading}
                  className="bg-nu-green hover:bg-nu-green/90"
                >
                  {spotsLeft > 0 ? (
                    <>{spotsLeft === (mission.volunteersNeeded ?? 0) ? 'Gabung' : `Gabung (${spotsLeft} tersisa)`}</>
                  ) : (
                    'Penuh'
                  )}
                </Button>
              )}
              {spotsLeft > 0 && spotsLeft <= 3 && (
                <span className="text-xs text-danger-red flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Segera
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  return `${Math.floor(hours / 24)}h`;
}

export default MissionCard;
