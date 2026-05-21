import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, PlayCircle, Coffee } from 'lucide-react';

type VolunteerStatus = 'available' | 'on-mission' | 'break';

interface StatusUpdateBarProps {
  currentStatus: VolunteerStatus;
  onStatusChange: (status: VolunteerStatus) => void;
  missionCount?: number;
}

const STATUS_OPTIONS: { key: VolunteerStatus; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'available', label: 'Available', icon: <Circle size={16} />, color: 'text-safe-green', bg: 'bg-safe-green/10' },
  { key: 'on-mission', label: 'On Mission', icon: <PlayCircle size={16} />, color: 'text-nu-green', bg: 'bg-nu-green/10' },
  { key: 'break', label: 'Istirahat', icon: <Coffee size={16} />, color: 'text-warning-yellow', bg: 'bg-warning-yellow/10' },
];

export function StatusUpdateBar({ currentStatus, onStatusChange, missionCount = 0 }: StatusUpdateBarProps) {
  return (
    <Card className="bg-nu-green overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${STATUS_OPTIONS.find(s => s.key === currentStatus)?.bg || 'bg-white/10'}`}>
              {STATUS_OPTIONS.find(s => s.key === currentStatus)?.icon}
            </div>
            <div>
              <p className="text-xs text-white/70">Status</p>
              <p className="text-sm font-semibold text-white">
                {STATUS_OPTIONS.find(s => s.key === currentStatus)?.label || currentStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onStatusChange(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentStatus === opt.key
                    ? 'bg-white text-nu-green'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {missionCount > 0 && (
            <Badge className="bg-white/20 text-white border-none shrink-0">
              {missionCount} misi aktif
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusUpdateBar;
