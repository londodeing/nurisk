import { Card, CardContent } from '@/components/ui/card';

interface DashboardSkeletonProps {
  variant?: 'full' | 'compact';
}

export function DashboardSkeleton(_props: DashboardSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="h-6 bg-slate-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-32 h-32 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="h-5 bg-slate-200 rounded w-32 mb-3 animate-pulse"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-200 rounded mb-2 animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardSkeleton;
