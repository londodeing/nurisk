import { Card, CardContent } from '@/components/ui/card';

interface DashboardSkeletonProps {
  variant?: 'full' | 'compact';
}

export function DashboardSkeleton({ variant = 'full' }: DashboardSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Preview */}
      {variant === 'full' && (
        <Card>
          <CardContent className="p-4">
            <div className="h-64 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Shimmer animation CSS (add to index.css if needed)
// .animate-shimmer {
//   background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
//   background-size: 200% 100%;
//   animation: shimmer 1.5s infinite;
// }
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }

export default DashboardSkeleton;