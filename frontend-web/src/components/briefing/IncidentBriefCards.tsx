'use client';

import { MapPin, Clock, Users, Truck, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IncidentBrief } from '@/services/briefingService';

interface IncidentBriefCardsProps {
  incidents: IncidentBrief[];
  className?: string;
  onIncidentClick?: (incident: IncidentBrief) => void;
}

export function IncidentBriefCards({
  incidents,
  className,
  onIncidentClick,
}: IncidentBriefCardsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-700">
        Ringkasan Incident Utama
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onClick={() => onIncidentClick?.(incident)}
          />
        ))}
      </div>

      {incidents.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Tidak ada incident besar</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface IncidentCardProps {
  incident: IncidentBrief;
  onClick?: () => void;
}

function IncidentCard({ incident, onClick }: IncidentCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">
            {incident.title}
          </h4>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          <span>{incident.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {formatTimeAgo(incident.reportedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {formatPopulation(incident.affectedPopulation)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-3 h-3 text-slate-400" />
          <span className="text-xs text-slate-500">
            {incident.resourcesAllocated} sumber daya
          </span>
        </div>

        {/* Action Taken */}
        <div className="pt-2 border-t border-slate-50">
          <p className="text-xs text-slate-400 mb-1">Tindakan:</p>
          <p className="text-xs text-slate-600 line-clamp-2">
            {incident.actionTaken}
          </p>
        </div>

        {/* Next Steps */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Langkah Selanjutnya:</p>
          <p className="text-xs text-slate-600 line-clamp-2">
            {incident.nextSteps}
          </p>
        </div>
      </div>
    </button>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-600',
    HIGH: 'bg-amber-100 text-amber-600',
    CRITICAL: 'bg-red-100 text-red-600',
  };
  const labels: Record<string, string> = {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    CRITICAL: 'Kritis',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', colors[severity])}>
      {labels[severity] || severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    REPORTED: 'bg-slate-100 text-slate-600',
    VERIFIED: 'bg-blue-100 text-blue-600',
    ASSESSMENT: 'bg-purple-100 text-purple-600',
    IN_PROGRESS: 'bg-amber-100 text-amber-600',
    RESOLVED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-slate-100 text-slate-400',
  };
  const labels: Record<string, string> = {
    REPORTED: 'Dilaporkan',
    VERIFIED: 'Terverifikasi',
    ASSESSMENT: 'Penilaian',
    IN_PROGRESS: 'Berlangsung',
    RESOLVED: 'Terselesaikan',
    CLOSED: 'Ditutup',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', colors[status])}>
      {labels[status] || status}
    </span>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Baru';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

function formatPopulation(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}rb`;
  }
  return count.toString();
}

export default IncidentBriefCards;