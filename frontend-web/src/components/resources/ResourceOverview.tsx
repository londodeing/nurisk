'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourceStats } from '@/hooks/use-resources';
import { 
  Users, 
  Truck, 
  Package, 
  Home, 
  Wrench,
  AlertTriangle 
} from 'lucide-react';

const resourceTypeIcons = {
  PERSONNEL: Users,
  VEHICLE: Truck,
  EQUIPMENT: Wrench,
  SUPPLIES: Package,
  SHELTER: Home,
};

const resourceTypeLabels = {
  PERSONNEL: 'Personel',
  VEHICLE: 'Kendaraan',
  EQUIPMENT: 'Peralatan',
  SUPPLIES: 'Persediaan',
  SHELTER: 'Pengungsian',
};

export function ResourceOverview() {
  const { stats, loading, error, refetch } = useResourceStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error: {error}</p>
          <button onClick={refetch} className="text-blue-500 underline">Retry</button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const utilizationPercent = Math.round((stats.deployed / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.deployed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{utilizationPercent}%</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-nu-green rounded-full" 
                style={{ width: `${utilizationPercent}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStock.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStock.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = resourceTypeIcons[resource.type] || Package;
                      return <Icon className="h-4 w-4 text-gray-500" />;
                    })()}
                    <span className="font-medium">{resource.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-bold">
                      {resource.available} / {resource.quantity}
                    </span>
                    <p className="text-xs text-gray-500">tersedia</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Resources by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(resourceTypeLabels).map(([type, label]) => {
              const Icon = resourceTypeIcons[type as keyof typeof resourceTypeIcons];
              return (
                <div 
                  key={type} 
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                >
                  <Icon className="h-8 w-8 text-nu-green mb-2" />
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-500">
                    {stats.total} total
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResourceOverview;