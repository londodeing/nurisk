import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/hooks/use-dashboard-stats';

interface KpiGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

function KpiSkeleton() {
  return (
    <div className="bg-white px-3 py-4 rounded-[20px] text-center shadow-[0_15px_35px_rgba(0,104,55,0.08)] border-b-[3px] border-b-[#D4AF37] space-y-1">
      <Skeleton className="h-6 w-10 mx-auto" />
      <Skeleton className="h-3 w-14 mx-auto" />
    </div>
  );
}

function KpiItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white px-3 py-4 rounded-[20px] text-center shadow-[0_15px_35px_rgba(0,104,55,0.08)] border-b-[3px] border-b-[#D4AF37]">
      <span className="font-['Playfair_Display',serif] text-xl md:text-2xl text-[#006837] block mb-0.5">
        {value}
      </span>
      <span className="text-[9px] md:text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export const KpiGrid = memo(function KpiGrid({ stats, isLoading }: KpiGridProps) {
  const items = [
    { value: stats?.totalIncidents ?? 0, label: 'Kejadian' },
    { value: stats?.activeMissions ?? 0, label: 'Misi Aktif' },
    { value: stats?.responseActions ?? 0, label: 'Respon Aksi' },
    { value: stats?.volunteersReady ?? 0, label: 'Relawan Siap' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item, i) => (
        <KpiItem key={i} value={item.value} label={item.label} />
      ))}
    </div>
  );
});
