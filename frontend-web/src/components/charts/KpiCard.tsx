import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  isLoading?: boolean;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-nu-green',
  iconBgColor = 'bg-nu-green/10',
  isLoading = false,
}: KpiCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            <div className="h-3 w-12 bg-slate-200 animate-pulse rounded" />
          </div>
          <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <p
              className={cn(
                'text-xs font-medium',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                !isPositive && !isNegative && 'text-slate-500'
              )}
            >
              {isPositive && '+'}
              {change}
              {changeLabel && ` ${changeLabel}`}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            iconBgColor
          )}
        >
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}