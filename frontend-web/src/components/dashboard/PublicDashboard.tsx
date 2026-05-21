import { Marker, Popup } from 'react-leaflet';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { IncidentFeed } from '@/components/dashboard/IncidentFeed';
import { NewsTicker } from '@/components/dashboard/NewsTicker';
import { DisasterAlertList } from '@/components/dashboard/DisasterAlertCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { MapDisplay } from '@/components/map/MapDisplay';
import { useIncidents } from '@/hooks/use-incidents';
import { AlertTriangle, Activity } from 'lucide-react';

const incidentIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const criticalIcon = icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function PublicDashboard() {
  const { data: incidentsData, isLoading: incidentsLoading, isError, error } = useIncidents();

  if (incidentsLoading) {
    return <DashboardSkeleton />;
  }

  // Handle error state - NO silent fallback
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

  // Use canonical ListResponse format: data.items
  const incidents = incidentsData?.items ?? [];

  const criticalCount = incidents.filter(
    (i: any) => i.severity === 'CRITICAL'
  ).length;

  const activeCount = incidents.filter(
    (i: any) => i.status !== 'COMPLETED'
  ).length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <NewsTicker />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Kejadian"
          value={incidents.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="warning"
        />
        <KpiCard
          title="Aktif"
          value={activeCount}
          icon={<Activity className="w-6 h-6" />}
          variant="danger"
        />
        <KpiCard
          title="Kritis"
          value={criticalCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[400px]">
                <MapDisplay
                  center={[-7.797068, 110.370529]}
                  zoom={8}
                  className="h-full w-full rounded-none"
                >
                  {incidents.map((incident: any) => (
                    incident.location?.lat && incident.location?.lng ? (
                      <Marker
                        key={incident.id}
                        position={[incident.location.lat, incident.location.lng]}
                        icon={incident.severity === 'CRITICAL' ? criticalIcon : incidentIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-bold">{incident.title}</p>
                            <p className="text-xs text-slate-500">{incident.location.lat}, {incident.location.lng}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}
                </MapDisplay>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <WeatherWidget />
          <IncidentFeed
            incidents={incidents}
            loading={incidentsLoading}
            error={isError ? error : null}
          />
        </div>
      </div>

      <DisasterAlertList
        alerts={incidents
          .filter((i: any) => i.severity === 'HIGH' || i.severity === 'CRITICAL')
          .slice(0, 5)
          .map((i: any) => ({
            id: i.id,
            type: i.type as 'BANJIR' | 'GEMPA' | 'LONGSOR' | 'KEBAKARAN_HUTAN' | 'EKSTREM_CUACA',
            title: i.title,
            location: i.location?.lat ? `${i.location.lat}, ${i.location.lng}` : '',
            severity: (i.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            createdAt: i.createdAt,
          }))
        }
      />
    </div>
  );
}

export default PublicDashboard;
