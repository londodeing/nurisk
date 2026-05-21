import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'reported' | 'verified' | 'assessment' | 'commanded' | 'responded' | 'completed';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-nu-green text-white hover:bg-nu-green/80',
    secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    destructive: 'border-transparent bg-danger-red text-white hover:bg-danger-red/80',
    outline: 'text-slate-950 border-slate-200',
    // Incident status colors
    reported: 'border-transparent bg-slate-500 text-white',
    verified: 'border-transparent bg-blue-500 text-white',
    assessment: 'border-transparent bg-warning-yellow text-white',
    commanded: 'border-transparent bg-orange-500 text-white',
    responded: 'border-transparent bg-safe-green text-white',
    completed: 'border-transparent bg-slate-800 text-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nu-green focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export const statusToBadge = (status = '') => {
  const s = status.toLowerCase();
  if (s === 'reported') return 'reported' as const;
  if (s === 'verified') return 'verified' as const;
  if (s === 'assessment') return 'assessment' as const;
  if (s === 'commanded') return 'commanded' as const;
  if (s === 'responded') return 'responded' as const;
  if (s === 'completed' || s === 'closed') return 'completed' as const;
  return 'default' as const;
};

export { Badge };
export default Badge;