/**
 * CommandKpiBar Component
 * KPI bar for Command Center showing incident stats
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Users, Package, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/use-incidents';
import { useVolunteers } from '@/hooks/use-volunteers';
import { useShelters } from '@/hooks/use-shelters';
import { useResourceStore } from '@/stores/use-resource-store';

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function KpiCard({ label, value, icon, color, onClick }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors',
        'border border-slate-700'
      )}
    >
      <div className={cn('p-2 rounded-lg', color)}>{icon}</div>
      <div className="text-left">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </button>
  );
}

export function CommandKpiBar() {
  const { data: incidents } = useIncidents();
  const { data: volunteers } = useVolunteers();
  const { data: shelters } = useShelters();
  const { data: resources } = useResourceStore();

  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Calculate counts
  useEffect(() => {
    const items = Array.isArray(incidents) ? incidents : incidents?.data ?? [];
    if (items.length) {
      setActiveCount(items.filter((i) => i.status !== 'COMPLETED' && i.status !== 'REJECTED' && i.status !== 'DISMISSED').length);
      setPendingCount(items.filter((i) => i.status === 'REPORTED' || i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length);
      setResolvedCount(items.filter((i) => i.status === 'COMPLETED').length);
    }
  }, [incidents]);

  const volunteerCount = volunteers?.length || 0;
  const shelterCount = shelters?.length || 0;
  const resourceCount = resources?.length || 0;

  return (
    <div className="bg-slate-900 border-t border-slate-700 p-4">
      <div className="grid grid-cols-6 gap-4">
        {/* Active Incidents */}
        <KpiCard
          label="Insiden Aktif"
          value={activeCount}
          icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
          color="bg-red-500/20"
        />

        {/* Pending Incidents */}
        <KpiCard
          label="Menunggu"
          value={pendingCount}
          icon={<Clock className="h-5 w-5 text-yellow-400" />}
          color="bg-yellow-500/20"
        />

        {/* Resolved Incidents */}
        <KpiCard
          label="Selesai"
          value={resolvedCount}
          icon={<CheckCircle className="h-5 w-5 text-green-400" />}
          color="bg-green-500/20"
        />

        {/* Volunteers */}
        <KpiCard
          label="Relawan Aktif"
          value={volunteerCount}
          icon={<Users className="h-5 w-5 text-blue-400" />}
          color="bg-blue-500/20"
        />

        {/* Shelters */}
        <KpiCard
          label="Pengungsian"
          value={shelterCount}
          icon={<Home className="h-5 w-5 text-green-400" />}
          color="bg-green-500/20"
        />

        {/* Resources */}
        <KpiCard
          label="Sumber Daya"
          value={resourceCount}
          icon={<Package className="h-5 w-5 text-purple-400" />}
          color="bg-purple-500/20"
        />
      </div>
    </div>
  );
}

export default CommandKpiBar;