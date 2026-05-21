/**
 * CommandMap Component
 * Tactical real-time map for command center
 */

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useIncidents } from '@/hooks/use-incidents';
import { useShelters } from '@/hooks/use-shelters';
import { useVolunteers } from '@/hooks/use-volunteers';
import { cn } from '@/lib/utils';
import type { Incident, Shelter, Volunteer } from '@nurisk/shared-types';

// Custom marker icons
const INCIDENT_ICONS: Record<string, Icon> = {
  REPORTED: new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  COMMANDED: new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  COMPLETED: new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
};

const SHELTER_ICON = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VOLUNTEER_ICON = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Map bounds for Java (Central Java)
const DEFAULT_CENTER: [number, number] = [-7.5755, 110.3645];
const DEFAULT_ZOOM = 9;

interface MapControlsProps {
  showIncidents: boolean;
  showShelters: boolean;
  showVolunteers: boolean;
  onToggleIncidents: () => void;
  onToggleShelters: () => void;
  onToggleVolunteers: () => void;
}

function MapControls({
  showIncidents,
  showShelters,
  showVolunteers,
  onToggleIncidents,
  onToggleShelters,
  onToggleVolunteers,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onToggleIncidents}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2',
          showIncidents
            ? 'bg-red-600 text-white'
            : 'bg-slate-800/80 text-slate-300'
        )}
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Insiden
      </button>
      <button
        onClick={onToggleShelters}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2',
          showShelters
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800/80 text-slate-300'
        )}
      >
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        Pengungsian
      </button>
      <button
        onClick={onToggleVolunteers}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2',
          showVolunteers
            ? 'bg-purple-600 text-white'
            : 'bg-slate-800/80 text-slate-300'
        )}
      >
        <span className="w-2 h-2 rounded-full bg-purple-500" />
        Relawan
      </button>
    </div>
  );
}

export function CommandMap() {
  // MUST expose isError for observability
  const { data: incidents, isLoading: incidentsLoading, isError: incidentsError } = useIncidents();
  const { data: shelters, isLoading: sheltersLoading, isError: sheltersError } = useShelters();
  const { data: volunteers, isLoading: volunteersLoading, isError: volunteersError } = useVolunteers();

  const [showIncidents, setShowIncidents] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [_selectedItem, setSelectedItem] = useState<Incident | Shelter | Volunteer | null>(null);

  // Filter incidents by status
  const items = Array.isArray(incidents) ? incidents : incidents?.data ?? [];
  const activeIncidents = items.filter((i) => i.status !== 'COMPLETED' && i.status !== 'REJECTED' && i.status !== 'DISMISSED');
  const pendingIncidents = items.filter((i) => i.status === 'REPORTED' || i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS');
  const resolvedIncidents = items.filter((i) => i.status === 'COMPLETED');

  // Map loading state
  const isMapLoading = incidentsLoading || sheltersLoading || volunteersLoading;
  const isMapError = incidentsError || sheltersError || volunteersError;

  return (
    <div className="flex-1 relative bg-slate-900">
      {/* Map Loading State */}
      {isMapLoading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/80">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-nu-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-white">Memuat data peta...</p>
          </div>
        </div>
      )}

      {/* Map Error State */}
      {isMapError && (
        <div className="absolute top-4 right-4 z-[2000] bg-red-900/90 rounded-lg p-4 max-w-sm">
          <p className="text-white font-medium">Gagal memuat data peta</p>
          <p className="text-sm text-red-200 mt-1">Silakan coba lagi</p>
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Incident Markers */}
        {showIncidents && items.map((incident) => {
          if (!incident.location?.lat || !incident.location?.lng) return null;
          return (
            <Marker
              key={incident.id}
              position={[incident.location.lat, incident.location.lng]}
              icon={INCIDENT_ICONS[incident.status] || INCIDENT_ICONS.REPORTED}
              eventHandlers={{
                click: () => setSelectedItem(incident),
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold">{incident.title}</h3>
                  <p className="text-sm">{incident.location.lat}, {incident.location.lng}</p>
                  <p className="text-sm capitalize">Status: {incident.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelter Markers */}
        {showShelters && shelters?.map((shelter: any) => {
          if (!shelter.latitude || !shelter.longitude) return null;
          return (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={SHELTER_ICON}
              eventHandlers={{
                click: () => setSelectedItem(shelter),
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold">{shelter.name}</h3>
                  <p className="text-sm">{shelter.address}</p>
                  <p className="text-sm">Kapasitas: {shelter.capacity}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Volunteer Markers */}
        {showVolunteers && (volunteers as unknown as Array<Record<string, unknown>>)
          .filter((v) => v.latitude && v.longitude)
          .map((volunteer) => (
            <Marker
              key={volunteer.id as string}
              position={[volunteer.latitude as number, volunteer.longitude as number]}
              icon={VOLUNTEER_ICON}
              eventHandlers={{
                click: () => setSelectedItem(volunteer as unknown as Volunteer),
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold">{volunteer.name as string}</h3>
                  <p className="text-sm">{volunteer.phone as string}</p>
                  <p className="text-sm capitalize">Status: {volunteer.status as string}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        showIncidents={showIncidents}
        showShelters={showShelters}
        showVolunteers={showVolunteers}
        onToggleIncidents={() => setShowIncidents(!showIncidents)}
        onToggleShelters={() => setShowShelters(!showShelters)}
        onToggleVolunteers={() => setShowVolunteers(!showVolunteers)}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-800/90 rounded-lg p-3 text-xs">
        <h4 className="font-medium mb-2">Legenda</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Insiden Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Menunggu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Selesai</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Pengungsian</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Relawan</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-800/90 rounded-lg p-3">
        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Aktif:</span>
            <span className="font-bold text-red-400">{activeIncidents.length}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Menunggu:</span>
            <span className="font-bold text-yellow-400">{pendingIncidents.length}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Selesai:</span>
            <span className="font-bold text-green-400">{resolvedIncidents.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandMap;