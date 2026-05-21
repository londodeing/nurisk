'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResources, useResourceAllocation } from '@/hooks/use-resources';
import type { Resource } from '@/services/resourceService';
import { MapPin, Package, ArrowRight } from 'lucide-react';

export function ResourceAllocation() {
  const { resources, loading, error, refetch } = useResources();
  const { allocate, deallocate: _deallocate, loading: allocationLoading } = useResourceAllocation();
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [draggedResource, setDraggedResource] = useState<Resource | null>(null);

  const handleDragStart = (resource: Resource) => {
    setDraggedResource(resource);
  };

  const handleDragEnd = () => {
    setDraggedResource(null);
  };

  const handleDrop = async (incidentId: string) => {
    if (!draggedResource || !incidentId) return;
    
    try {
      await allocate(draggedResource.id, incidentId, 1);
      refetch();
      setSelectedIncident('');
    } catch (err) {
      console.error('Failed to allocate:', err);
    }
  };

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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incident Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Alokasi ke Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Masukkan ID Incident..."
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="flex-1"
            />
            <Button disabled={!selectedIncident || !draggedResource}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Alokasikan
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Drag resource ke incident untuk mengalokasikan
          </p>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Tipe</th>
                  <th className="text-left p-3">Tersedia</th>
                  <th className="text-left p-3">Diploy</th>
                  <th className="text-left p-3">Lokasi</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr 
                    key={resource.id} 
                    className="border-b hover:bg-gray-50 cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(resource)}
                    onDragEnd={handleDragEnd}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{resource.name}</span>
                      </div>
                    </td>
                    <td className="p-3 capitalize">{resource.type.toLowerCase()}</td>
                    <td className="p-3">
                      <span className="text-green-600 font-bold">
                        {resource.available}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-blue-600">{resource.deployed}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {resource.location?.name || resource.warehouse || '-'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        resource.status === 'available' 
                          ? 'bg-green-100 text-green-800'
                          : resource.status === 'deployed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={resource.available === 0 || allocationLoading}
                        onClick={() => handleDrop(selectedIncident)}
                      >
                        Alokasikan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResourceAllocation;