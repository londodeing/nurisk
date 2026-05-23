import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import type { Incident } from '@nurisk/shared-types/incident';

interface ActiveIncidentsPanelProps {
  incidents: Incident[];
  isLoading: boolean;
  error: Error | null;
}

const SEVERITY_EMOJI: Record<string, string> = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢',
};

const STATUS_BADGE: Record<string, { label: string; bg: string }> = {
  REPORTED: { label: 'Reported', bg: 'bg-[#006837]' },
  VERIFIED: { label: 'Verified', bg: 'bg-[#006837]' },
  ASSESSED: { label: 'Assess', bg: '#F97316' },
  IN_PROGRESS: { label: 'Action', bg: '#3B82F6' },
  RESOLVED: { label: 'Resolved', bg: '#6B7280' },
  CLOSED: { label: 'Closed', bg: '#6B7280' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  return `${Math.floor(hours / 24)}h`;
}

function EventCard({ incident }: { incident: Incident }) {
  const status = STATUS_BADGE[incident.status] || { label: incident.status, bg: 'bg-gray-500' };
  const emoji = SEVERITY_EMOJI[incident.severity] || '📍';

  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_15px_35px_rgba(0,104,55,0.08)] border border-gray-100 mb-6">
      <div className="h-[150px] bg-[#F0F4F0] flex items-center justify-center relative">
        <span className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white shadow-sm ${status.bg}`}>
          {status.label}
        </span>
        <span className="text-4xl">{emoji}</span>
      </div>
      <div className="p-5">
        <h4 className="font-['Playfair_Display',serif] text-lg mb-2">
          {incident.title || incident.description?.slice(0, 50) || 'Kejadian Bencana'}
        </h4>
        <p className="text-xs text-[#6B7280] leading-relaxed mb-3.5 line-clamp-2">
          {incident.description || 'Tidak ada deskripsi'}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3.5">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {incident.location?.address ?? `${incident.location?.lat?.toFixed(3) ?? '-'}, ${incident.location?.lng?.toFixed(3) ?? '-'}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeAgo(incident.createdAt)}
          </span>
        </div>
        <a
          href={`https://wa.me/6281234567890?text=Bantuan%20${encodeURIComponent(incident.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white no-underline py-3 rounded-[15px] font-bold text-xs transition-transform active:scale-[0.98]"
        >
          💬 Hubungi Tim TRC NU Peduli
        </a>
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_15px_35px_rgba(0,104,55,0.08)] border border-gray-100 mb-6">
      <Skeleton className="h-[150px] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-11 w-full rounded-[15px]" />
      </div>
    </div>
  );
}

export const ActiveIncidentsPanel = memo(function ActiveIncidentsPanel({ incidents, isLoading, error }: ActiveIncidentsPanelProps) {
  if (isLoading) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Bencana Terverifikasi</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <EventSkeleton />
        <EventSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Bencana Terverifikasi</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center py-10 bg-white rounded-[32px] shadow-sm border border-gray-100">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-500 font-medium">Gagal memuat data</p>
          <p className="text-xs text-[#6B7280] mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Bencana Terverifikasi</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center py-10 bg-white rounded-[32px] shadow-sm border border-gray-100">
          <span className="text-4xl block mb-2">✅</span>
          <p className="text-sm text-[#6B7280]">Tidak ada kejadian aktif</p>
        </div>
      </div>
    );
  }

  const sorted = [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Bencana Terverifikasi</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      {sorted.slice(0, 3).map((incident) => (
        <EventCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
});
