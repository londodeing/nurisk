import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { IncidentFeed } from '@/components/dashboard/IncidentFeed';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useIncidents } from '@/hooks/use-incidents';

export function PublicDashboard() {
  const { data: incidentsData, isLoading: incidentsLoading, isError, error } = useIncidents();

  if (incidentsLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium">Gagal memuat kejadian</p>
          <p className="text-red-500 text-sm mt-1">{error?.message}</p>
        </div>
      </div>
    );
  }

  const incidents = incidentsData?.items ?? [];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <IncidentFeed
            incidents={incidents}
            loading={incidentsLoading}
            error={isError ? error : null}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <WeatherWidget compact />
        </div>
      </div>
    </div>
  );
}

export default PublicDashboard;
