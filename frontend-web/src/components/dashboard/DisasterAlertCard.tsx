import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Waves, CloudRain, CloudLightning, Flame } from 'lucide-react';
import type { Incident, DisasterType, PriorityLevel } from '@nurisk/shared-types/incident';

// Canonical disaster type icons
const typeIcons: Record<DisasterType, React.ReactNode> = {
  BANJIR: <Waves className="w-5 h-5 text-blue-500" />,
  GEMPA: <CloudLightning className="w-5 h-5 text-slate-500" />,
  LONGSOR: <CloudRain className="w-5 h-5 text-amber-500" />,
  KEBAKARAN_HUTAN: <Flame className="w-5 h-5 text-danger-red" />,
  KEBAKARAN_BANGUNAN: <Flame className="w-5 h-5 text-danger-red" />,
  TSUNAMI: <Waves className="w-5 h-5 text-blue-500" />,
  VOLKANO: <CloudLightning className="w-5 h-5 text-slate-500" />,
  EKSTREM_CUACA: <CloudRain className="w-5 h-5 text-purple-500" />,
  WABAH_PENYAKIT: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

// Canonical severity variants
const severityVariants: Record<PriorityLevel, 'default' | 'destructive' | 'secondary'> = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'secondary',
  CRITICAL: 'destructive',
};

// Canonical severity labels
const severityLabels: Record<PriorityLevel, string> = {
  LOW: 'Ringan',
  MEDIUM: 'Menengah',
  HIGH: 'Tinggi',
  CRITICAL: 'Kritis',
};

interface DisasterAlertCardProps {
  alert: Incident;
  onDismiss?: (id: string) => void;
}

export function DisasterAlertCard({ alert, onDismiss }: DisasterAlertCardProps) {
  const timeAgo = getTimeAgo(new Date(alert.createdAt));

  return (
    <Link to={`/incidents/${alert.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {typeIcons[alert.type] || <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{alert.title}</h4>
                <Badge variant={severityVariants[alert.severity]}>
                  {severityLabels[alert.severity]}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 truncate">{alert.location?.address}</p>
              <p className="text-xs text-slate-400 mt-1">{timeAgo}</p>
            </div>
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDismiss(alert.id);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface DisasterAlertListProps {
  alerts: Incident[];
  onDismiss?: (id: string) => void;
}

export function DisasterAlertList({ alerts, onDismiss }: DisasterAlertListProps) {
  // Sort: CRITICAL first, then by recency
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<PriorityLevel, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (sortedAlerts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Tidak ada peringatan bencana aktif
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedAlerts.map(alert => (
        <DisasterAlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Helper function
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

export default DisasterAlertCard;