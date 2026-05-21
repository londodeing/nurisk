'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useShelters } from '@/hooks/use-shelters';
import { ShelterCapacityStatus, ShelterStatus } from '@nurisk/shared-types';

// Fix marker icon issue

// Capacity color mapping
const CAPACITY_COLORS = {
  [ShelterCapacityStatus.AVAILABLE]: '#22c55e', // GREEN - available
  [ShelterCapacityStatus.WARNING]: '#eab308',   // YELLOW - 75%+
  [ShelterCapacityStatus.FULL]: '#dc2626',         // RED - full
  [ShelterCapacityStatus.OVERCAPACITY]: '#7f1d1d', // DARK RED - overcapacity
};

// Custom marker icon
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface ShelterMapViewProps {
  incidentId?: string;
  onShelterClick?: (shelterId: string) => void;
}

export function ShelterMapView({ incidentId, onShelterClick }: ShelterMapViewProps) {
  const { shelters, loading, error } = useShelters({ 
    status: ShelterStatus.ACTIVE 
  });
  const [_selectedShelter, setSelectedShelter] = useState<string | null>(null);
  const [mapCenter, _setMapCenter] = useState<[number, number]>([-7.5, 112.5]); // Default: East Java

  // Filter by incident if provided
  const filteredShelters = incidentId
    ? shelters.filter(s => s.incidentId === incidentId)
    : shelters;

  const handleMarkerClick = (shelterId: string) => {
    setSelectedShelter(shelterId);
    onShelterClick?.(shelterId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={10}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredShelters.map((shelter) => {
          const color = CAPACITY_COLORS[shelter.capacityStatus];
          const icon = createIcon(color);
          
          return (
            <Marker
              key={shelter.id}
              position={[shelter.location.lat, shelter.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(shelter.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{shelter.name}</h3>
                  <p className="text-sm text-gray-600">{shelter.address}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className="capitalize">{shelter.status}</span>
                    </p>
                    <p>
                      <span className="font-medium">Kapasitas:</span>{' '}
                      {shelter.currentOccupancy}/{shelter.capacity}
                    </p>
                    {shelter.incidentId && (
                      <p>
                        <span className="font-medium">Incident:</span>{' '}
                        {shelter.incidentId}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <p className="text-xs font-medium mb-2">Kapasitas:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">75%+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs">Penuh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-900"></div>
            <span className="text-xs">Overcapacity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShelterMapView;