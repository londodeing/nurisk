'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShelters } from '@/hooks/use-shelters';
import { MapPin } from 'lucide-react';
import { ShelterMapView } from './ShelterMapView';
import type { ShelterStatus, ShelterCapacityStatus } from '@nurisk/shared-types';

const statusColors: Record<ShelterStatus, string> = {
  PROPOSED: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  FULL: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  CLOSED: 'bg-red-100 text-red-800',
};

const capacityColors: Record<ShelterCapacityStatus, string> = {
  AVAILABLE: 'bg-green-500',
  WARNING: 'bg-yellow-500',
  FULL: 'bg-red-500',
  OVERCAPACITY: 'bg-red-900',
};

export function ShelterList() {
  const { shelters, loading, error, refetch } = useShelters({});
  const [view, setView] = useState<'table' | 'map'>('table');

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={refetch}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={view === 'table' ? 'default' : 'outline'} onClick={() => setView('table')}>
          Table
        </Button>
        <Button variant={view === 'map' ? 'default' : 'outline'} onClick={() => setView('map')}>
          Map
        </Button>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Shelter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3">Kode</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Kapasitas</th>
                    <th className="text-left p-3">PIC</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {shelters.map((shelter) => (
                    <tr key={shelter.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{shelter.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{shelter.code}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[shelter.status]}`}>
                          {shelter.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${capacityColors[shelter.capacityStatus]}`}
                              style={{ width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {shelter.currentOccupancy}/{shelter.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">{shelter.picId ? 'Assigned' : '-'}</td>
                      <td className="p-3">
                        <Link to={`/dashboard/admin/shelters/${shelter.id}`}>
                          <Button variant="outline" size="sm">Detail</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map View */}
      {view === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Peta Shelter</CardTitle>
          </CardHeader>
          <CardContent>
            <ShelterMapView />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ShelterList;