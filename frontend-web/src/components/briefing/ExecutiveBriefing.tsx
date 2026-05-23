'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBriefingData, useBriefing } from '@/hooks/use-briefing';
import { SituationSummaryComponent } from './SituationSummary';
import { KPIDashboard } from './KPIDashboard';
import { IncidentBriefCards } from './IncidentBriefCards';
import { RecommendationPanel } from './RecommendationPanel';
import { BriefingExport } from './BriefingExport';

interface ExecutiveBriefingProps {
  className?: string;
}

export function ExecutiveBriefing({ className }: ExecutiveBriefingProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { data, isLoading, isError } = useBriefingData();
  const { data: briefing, refetch, isRefetching } = useBriefing(period);

  const briefingData = briefing ?? ({} as any);
  const incidentData = data?.incidents ?? [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">
            Executive Briefing
          </h1>
          <p className="text-sm text-slate-500">
            Ringkasan situasi untuk pimpinan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <PeriodButton
              active={period === 'daily'}
              onClick={() => setPeriod('daily')}
            >
              Harian
            </PeriodButton>
            <PeriodButton
              active={period === 'weekly'}
              onClick={() => setPeriod('weekly')}
            >
              Mingguan
            </PeriodButton>
            <PeriodButton
              active={period === 'monthly'}
              onClick={() => setPeriod('monthly')}
            >
              Bulanan
            </PeriodButton>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn(
                'w-4 h-4 text-slate-600',
                isRefetching && 'animate-spin'
              )}
            />
          </button>

          {/* Export */}
          <BriefingExport briefing={briefingData} />
        </div>
      </div>

      {/* Error State - Explicit error without fallback */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">Gagal memuat data briefing</p>
          <p className="text-red-500 text-sm mt-1">
            Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <BriefingSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Situation Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
            <SituationSummaryComponent situation={data.situation} />
          </div>

          {/* KPI Dashboard */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
            <KPIDashboard metrics={data.metrics} />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Brief Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <IncidentBriefCards incidents={incidentData} />
            </div>

            {/* Recommendation Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <RecommendationPanel actions={data.actions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function PeriodButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-white text-slate-700 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      )}
    >
      {children}
    </button>
  );
}

// Loading skeleton
function BriefingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-slate-100 rounded-lg" />
          <div className="h-10 w-10 bg-slate-100 rounded-lg" />
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Situation Summary */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-10 w-20 bg-slate-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="space-y-4">
          <div className="h-5 w-32 bg-slate-100 rounded" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-100 p-4">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-slate-100 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-100 p-4">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-slate-100 rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveBriefing;