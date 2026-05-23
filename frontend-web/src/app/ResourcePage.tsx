import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Box, RefreshCw } from 'lucide-react';
import { useResources, useResourceStats, type Resource } from '@/hooks/use-resources';

const typeLabels: Record<string, string> = {
  FOOD: 'Makanan',
  WATER: 'Air Bersih',
  SHELTER: 'Pengungsian',
  MEDICAL: 'Medis',
  TRANSPORT: 'Transportasi',
  COMMUNICATION: 'Komunikasi',
  EQUIPMENT: 'Peralatan',
  CLOTHING: 'Pakaian',
  HYGIENE: 'Hygiene',
  OTHER: 'Lainnya',
};

const typeColors: Record<string, string> = {
  FOOD: 'bg-orange-100 text-orange-700 border-orange-200',
  WATER: 'bg-blue-100 text-blue-700 border-blue-200',
  SHELTER: 'bg-rose-100 text-rose-700 border-rose-200',
  MEDICAL: 'bg-red-100 text-red-700 border-red-200',
  TRANSPORT: 'bg-amber-100 text-amber-700 border-amber-200',
  COMMUNICATION: 'bg-purple-100 text-purple-700 border-purple-200',
  EQUIPMENT: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOTHING: 'bg-teal-100 text-teal-700 border-teal-200',
  HYGIENE: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabels: Record<string, string> = {
  available: 'Tersedia',
  allocated: 'Dialokasikan',
  consumed: 'Terpakai',
  reserved: 'Dicadangkan',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  allocated: 'bg-blue-100 text-blue-700',
  consumed: 'bg-slate-100 text-slate-600',
  reserved: 'bg-amber-100 text-amber-700',
};

function ResourceCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
        <div className="h-5 bg-slate-200 rounded w-36 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-24" />
      </CardContent>
    </Card>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const label = typeLabels[resource.type] || resource.type;
  const colorClass = typeColors[resource.type] || 'bg-slate-100 text-slate-700 border-slate-200';
  const statusLabel = statusLabels[resource.status] || resource.status;
  const statusColor = statusColors[resource.status] || 'bg-slate-100 text-slate-600';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={`${colorClass} text-xs`}>
            {label}
          </Badge>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{resource.name}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{resource.quantity} {resource.unit}</span>
          {resource.supplier && (
            <span className="text-slate-400 text-xs">{resource.supplier}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourcePage() {
  const { data: resourcesData, isLoading, isError, error, refetch } = useResources({});
  const { data: stats, isLoading: statsLoading } = useResourceStats();

  const resources = resourcesData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 mb-1">Total Sumber Daya</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{stats?.total ?? '-'}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 mb-1">Tersedia</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{stats?.available ?? '-'}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 mb-1">Digunakan</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats?.deployed ?? '-'}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 mb-1">Utilisasi</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{stats?.utilizationRate ?? 0}%</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800 mb-1">Gagal memuat data sumber daya</h3>
            <p className="text-sm text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && resources.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <Box className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Belum Ada Sumber Daya</h3>
            <p className="text-sm text-slate-500">Belum ada data sumber daya yang tersedia saat ini</p>
          </CardContent>
        </Card>
      )}

      {/* Resource List */}
      {!isLoading && !isError && resources.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Sumber Daya</h2>
            <span className="text-sm text-slate-400">{resources.length} item</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </>
      )}

      {/* Low Stock Alerts */}
      {stats?.lowStock && stats.lowStock.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Stok Menipis
            </h3>
            <div className="space-y-2">
              {stats.lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{typeLabels[item.type] || item.type}</p>
                  </div>
                  <span className="text-red-600 font-bold text-sm">{item.quantity} tersisa</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ResourcePage;
