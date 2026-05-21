import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Calendar, MapPin, AlertTriangle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useIncidents } from '@/features/incidents/hooks/useIncidents';
import { IncidentFilters } from './IncidentFilters';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import type { Incident, IncidentFilter, DisasterType } from '@nurisk/shared-types/incident';

// Canonical disaster type labels
const typeLabels: Record<DisasterType, string> = {
  BANJIR: 'Banjir',
  LONGSOR: 'Longsor',
  GEMPA: 'Gempa',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Erupsi',
  KEBAKARAN_HUTAN: 'Kebakaran Hutan',
  KEBAKARAN_BANGUNAN: 'Kebakaran Bangunan',
  EKSTREM_CUACA: 'Ekstrem Cuaca',
  WABAH_PENYAKIT: 'Wabah Penyakit',
};

// Incident Card View
function IncidentCard({ incident }: { incident: Incident }) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{incident.title}</CardTitle>
          <IncidentStatusBadge status={incident.status} severity={incident.severity} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{incident.location.address ?? `${incident.location.lat}, ${incident.location.lng}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline">{typeLabels[incident.type as DisasterType] || incident.type}</Badge>
            <span>•</span>
            <Calendar className="w-4 h-4" />
            <span>{new Date(incident.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => navigate(`/incidents/${incident.id}`)}>
            Detail
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/incidents/${incident.id}/timeline`)}>
            Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Incident Table Row
function IncidentRow({ incident }: { incident: Incident }) {
  const navigate = useNavigate();

  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="p-3">
        <Link to={`/incidents/${incident.id}`} className="font-medium hover:underline">
          {incident.title}
        </Link>
      </td>
      <td className="p-3">
        <Badge variant="outline">{typeLabels[incident.type as DisasterType] || incident.type}</Badge>
      </td>
      <td className="p-3 truncate max-w-[150px]">{incident.location.address ?? `${incident.location.lat}, ${incident.location.lng}`}</td>
      <td className="p-3">
        <IncidentStatusBadge status={incident.status} severity={incident.severity} />
      </td>
      <td className="p-3 text-sm text-slate-500">
        {new Date(incident.createdAt).toLocaleDateString('id-ID')}
      </td>
      <td className="p-3">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => navigate(`/incidents/${incident.id}`)}>
            Detail
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/incidents/${incident.id}/timeline`)}>
            Timeline
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Main Component
export function IncidentList() {
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'card'>('table');
  const [filters, setFilters] = useState<IncidentFilter>({
    search: '',
    type: '',
    status: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch incidents - MUST expose isError for observability
  const { data, isLoading, isError, error } = useIncidents({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    severity: filters.severity || undefined,
  });

  const incidents: Incident[] = (data as any)?.data || [];
  const totalPages = (data as any)?.pagination?.totalPages || 1;

  const handleFilterChange = useCallback((newFilters: IncidentFilter) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Daftar Kejadian</h1>
            <p className="text-sm opacity-80">Kelola semua incident</p>
          </div>
          <Button onClick={() => navigate('/incidents/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Incident Baru
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-4">
        {/* Filters */}
        <IncidentFilters 
          onFilterChange={handleFilterChange} 
          onViewChange={setView}
          view={view}
        />

        {/* Incident List - MUST handle error state explicitly */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-nu-green border-t-transparent rounded-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium">Gagal memuat incidents</p>
            <p className="text-sm text-slate-500 mt-2">{error?.message || 'Terjadi kesalahan'}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada incident ditemukan</p>
            <Button className="mt-4" onClick={() => navigate('/incidents/new')}>
              Buat incident pertama
            </Button>
          </div>
        ) : view === 'card' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-3 text-sm font-medium">Judul</th>
                    <th className="text-left p-3 text-sm font-medium">Jenis</th>
                    <th className="text-left p-3 text-sm font-medium">Lokasi</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Tanggal</th>
                    <th className="text-left p-3 text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default IncidentList;