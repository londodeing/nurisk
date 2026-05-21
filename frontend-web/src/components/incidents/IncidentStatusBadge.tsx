import { Badge } from '@/components/ui/badge';
import type { IncidentStatus, PriorityLevel } from '@nurisk/shared-types/incident';

interface IncidentStatusBadgeProps {
  status?: IncidentStatus;
  severity?: PriorityLevel;
  className?: string;
}

// Canonical status colors mapping
const statusColors: Record<IncidentStatus, string> = {
  REPORTED: 'border-red-200 bg-red-50 text-red-700',
  ASSIGNED: 'border-blue-200 bg-blue-50 text-blue-700',
  IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-700',
  RESOLVED: 'border-green-200 bg-green-50 text-green-700',
  CLOSED: 'border-slate-200 bg-slate-50 text-slate-700',
};

// Canonical severity colors mapping
const severityColors: Record<PriorityLevel, string> = {
  CRITICAL: 'border-red-500 bg-red-100 text-red-800',
  HIGH: 'border-orange-500 bg-orange-100 text-orange-800',
  MEDIUM: 'border-yellow-500 bg-yellow-100 text-yellow-800',
  LOW: 'border-green-500 bg-green-100 text-green-800',
};

// Status display labels
const statusLabels: Record<IncidentStatus, string> = {
  REPORTED: 'Dilaporkan',
  ASSIGNED: 'Ditugaskan',
  IN_PROGRESS: 'Sedang Berlangsung',
  RESOLVED: 'Terselesaikan',
  CLOSED: 'Ditutup',
};

// Severity display labels
const severityLabels: Record<PriorityLevel, string> = {
  CRITICAL: 'Kritis',
  HIGH: 'Tinggi',
  MEDIUM: 'Sedang',
  LOW: 'Rendah',
};

export function IncidentStatusBadge({ status, severity, className = '' }: IncidentStatusBadgeProps) {
  const colorClass = status ? statusColors[status] : severity ? severityColors[severity] : '';
  const label = status ? statusLabels[status] : severity ? severityLabels[severity] : '';
  
  return (
    <Badge variant="outline" className={`${colorClass} ${className}`}>
      {label}
    </Badge>
  );
}

export default IncidentStatusBadge;