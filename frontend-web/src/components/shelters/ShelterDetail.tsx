'use client';

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useShelter, useShelterOccupancy, useShelterCrew, useShelterEquipment, useShelterTimeline } from '@/hooks/use-shelters';
import { MapPin, Users, Package, Clock, Shield } from 'lucide-react';
import { ShelterStatus, ShelterCapacityStatus } from '@nurisk/shared-types';

// =============================================================================
// Helper Components
// =============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-gray-500">Memuat...</p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-red-500">Error: {error}</p>
    </div>
  );
}

// =============================================================================
// Shelter Information Panel
// =============================================================================

function ShelterInfoPanel({ shelter }: { shelter: any }) {
  const statusColors: Record<string, string> = {
    PROPOSED: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    FULL: 'bg-red-100 text-red-800',
    INACTIVE: 'bg-gray-100 text-gray-600',
    CLOSED: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Shelter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nama</p>
            <p className="font-medium">{shelter.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kode</p>
            <p className="font-medium">{shelter.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge className={statusColors[shelter.status]}>{shelter.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kapasitas</p>
            <p className="font-medium">{shelter.capacity}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Alamat</p>
          <p className="font-medium">{shelter.address}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Lokasi</p>
          <p className="font-medium">
            {shelter.location?.lat}, {shelter.location?.lng}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Occupancy Monitoring Panel
// =============================================================================

function OccupancyPanel({ shelterId }: { shelterId: string }) {
  const { occupancy, loading, error } = useShelterOccupancy(shelterId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!occupancy) return null;

  const occupancyRate = (occupancy.total / 100) * 100; // Calculate based on shelter capacity

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penghuni</CardTitle>
        <CardDescription>Monitoring kapasitas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{occupancy.total}</span>
          <span className="text-gray-500">/ {occupancy.total} kapasitas</span>
        </div>
        
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              occupancyRate > 100 ? 'bg-red-900' : 
              occupancyRate > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Laki-laki</p>
            <p className="font-medium">{occupancy.male}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Perempuan</p>
            <p className="font-medium">{occupancy.female}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Anak-anak</p>
            <p className="font-medium">{occupancy.children}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lansia</p>
            <p className="font-medium">{occupancy.elderly}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Terakhir diperbarui: {new Date(occupancy.lastUpdated).toLocaleString('id-ID')}
        </p>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Crew List Panel
// =============================================================================

function CrewPanel({ shelterId }: { shelterId: string }) {
  const { crew, loading, error } = useShelterCrew(shelterId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kru</CardTitle>
        <CardDescription>Tim yang bertugas</CardDescription>
      </CardHeader>
      <CardContent>
        {crew.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada kru</p>
        ) : (
          <div className="space-y-3">
            {crew.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{member.volunteerName}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <Badge variant={member.status === 'ON_DUTY' ? 'default' : 'outline'}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Equipment Panel
// =============================================================================

function EquipmentPanel({ shelterId }: { shelterId: string }) {
  const { equipment, loading, error } = useShelterEquipment(shelterId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peralatan</CardTitle>
        <CardDescription>Daftar peralatan</CardDescription>
      </CardHeader>
      <CardContent>
        {equipment.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada peralatan</p>
        ) : (
          <div className="space-y-3">
            {equipment.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">x{item.quantity}</p>
                  <p className="text-xs text-gray-500">{item.condition}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Timeline Panel
// =============================================================================

function TimelinePanel({ shelterId }: { shelterId: string }) {
  const { timeline, loading, error } = useShelterTimeline(shelterId);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Riwayat aktivitas</CardDescription>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada aktivitas</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((event: any) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-nu-green"></div>
                  <div className="w-px h-full bg-gray-200"></div>
                </div>
                <div className="pb-4">
                  <p className="font-medium">{event.description}</p>
                  <p className="text-sm text-gray-500">{event.userName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ShelterDetail() {
  const { id } = useParams<{ id: string }>();
  const { shelter, loading, error } = useShelter(id);
  const [activePanel, setActivePanel] = useState<
    'info' | 'occupancy' | 'crew' | 'equipment' | 'timeline'
  >('info');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!shelter) return <ErrorState error="Shelter tidak ditemukan" />;

  const panels = [
    { id: 'info', label: 'Informasi', icon: MapPin },
    { id: 'occupancy', label: 'Penghuni', icon: Users },
    { id: 'crew', label: 'Kru', icon: Shield },
    { id: 'equipment', label: 'Peralatan', icon: Package },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard/admin/shelters" className="text-sm text-nu-green hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold">{shelter.name}</h1>
          <p className="text-gray-500">{shelter.code}</p>
        </div>
        <Badge className="text-lg px-4 py-2">{shelter.status}</Badge>
      </div>

      {/* Panel Navigation */}
      <div className="flex gap-2 border-b">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activePanel === panel.id
                ? 'border-nu-green text-nu-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <panel.icon className="h-4 w-4" />
            {panel.label}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      {activePanel === 'info' && <ShelterInfoPanel shelter={shelter} />}
      {activePanel === 'occupancy' && <OccupancyPanel shelterId={id!} />}
      {activePanel === 'crew' && <CrewPanel shelterId={id!} />}
      {activePanel === 'equipment' && <EquipmentPanel shelterId={id!} />}
      {activePanel === 'timeline' && <TimelinePanel shelterId={id!} />}
    </div>
  );
}

export default ShelterDetail;