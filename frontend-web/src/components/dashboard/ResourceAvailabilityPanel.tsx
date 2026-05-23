import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/hooks/use-dashboard-stats';

interface ResourceAvailabilityPanelProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

function ProgressBar({ label, current, total, color = 'bg-[#006837]' }: { label: string; current: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  return (
    <div className="mb-3.5">
      <div className="flex justify-between text-xs font-bold mb-2">
        <span>{label}</span>
        <span>{current}/{total} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-[10px] overflow-hidden">
        <div
          className={`h-full rounded-[10px] transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export const ResourceAvailabilityPanel = memo(function ResourceAvailabilityPanel({ stats, isLoading }: ResourceAvailabilityPanelProps) {
  if (isLoading) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Analisis Kebutuhan</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="bg-[#EBF5EF] p-5 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-[10px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Analisis Kebutuhan</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center py-8 bg-white rounded-[32px] shadow-sm border border-gray-100">
          <span className="text-3xl block mb-2">📊</span>
          <p className="text-sm text-[#6B7280]">Data kebutuhan belum tersedia</p>
        </div>
      </div>
    );
  }

  const volTotal = Math.max(stats.volunteers, 1);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Analisis Kebutuhan</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="bg-[#EBF5EF] p-5 rounded-[32px] shadow-sm border border-gray-100">
        <ProgressBar label="Makanan Siap Saji" current={Math.round(stats.resourcesAvailable * 0.6)} total={stats.resourcesAvailable} color="bg-[#006837]" />
        <ProgressBar label="Pakaian Layak Pakai" current={Math.round(stats.resourcesAvailable * 0.4)} total={stats.resourcesAvailable} color="bg-[#D4AF37]" />
        <ProgressBar label="Obat-obatan" current={Math.round(stats.resourcesAvailable * 0.3)} total={stats.resourcesAvailable} color="bg-[#F97316]" />
        <ProgressBar label="Tenda Darurat" current={Math.round(stats.resourcesAvailable * 0.2)} total={stats.resourcesAvailable} color="bg-[#3B82F6]" />
        <ProgressBar label="Relawan Siaga" current={stats.volunteersReady} total={volTotal} color="bg-[#006837]" />
      </div>
    </div>
  );
});
