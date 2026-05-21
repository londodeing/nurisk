'use client';

import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusLabel, getRegionStatusColor } from '@/services/briefingService';
import type { SituationSummary, RegionStatus } from '@/services/briefingService';

interface SituationSummaryProps {
  situation: SituationSummary;
  className?: string;
}

export function SituationSummaryComponent({
  situation,
  className,
}: SituationSummaryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Status Keseluruhan</p>
          <h2 className="text-lg font-semibold text-slate-700">
            {situation.headline}
          </h2>
        </div>
        <div
          className={cn(
            'px-4 py-2 rounded-lg font-semibold',
            getStatusColor(situation.overall)
          )}
        >
          {getStatusLabel(situation.overall)}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3">
        {situation.details.map((detail, index) => (
          <div
            key={index}
            className="bg-slate-50 rounded-lg p-3 text-center"
          >
            <p className="text-sm text-slate-600">{detail}</p>
          </div>
        ))}
      </div>

      {/* Regions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Status per Wilayah
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {situation.regions.map((region) => (
            <RegionCard key={region.region} region={region} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function RegionCard({ region }: { region: RegionStatus }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          {region.region}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            getRegionStatusColor(region.status)
          )}
        >
          {region.status === 'normal'
            ? 'Normal'
            : region.status === 'watch'
            ? 'Waspada'
            : region.status === 'warning'
            ? 'Siaga'
            : 'Darurat'}
        </span>
        <TrendIcon trend={region.trend} />
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: RegionStatus['trend'] }) {
  if (trend === 'increasing') {
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  }
  if (trend === 'decreasing') {
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  }
  return <Minus className="w-4 h-4 text-slate-400" />;
}

export default SituationSummaryComponent;