'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import { cn } from '@/lib/utils';
import type { Incident, SkillMatch } from '@/services/volunteerDispatchService';
import 'leaflet/dist/leaflet.css';

interface DispatchMapProps {
  incident: Incident;
  matches: SkillMatch[];
  selectedIds: string[];
  onSelectVolunteer: (id: string) => void;
  className?: string;
}

// Map controller for centering
function MapController({
  incident,
  matches,
}: {
  incident: Incident;
  matches: SkillMatch[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!incident.location) return;

    const bounds = new LatLngBounds([
      incident.location,
      ...matches.map((m) => m.volunteer.location),
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, incident, matches]);

  return null;
}

export function DispatchMap({
  incident,
  matches,
  selectedIds,
  onSelectVolunteer,
  className,
}: DispatchMapProps) {
  const availableMatches = matches.filter((m) => m.volunteer.status === 'available');

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <MapContainer
        center={[incident.location.lat, incident.location.lng]}
        zoom={12}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController incident={incident} matches={matches} />

        {/* Incident Marker (Red) */}
        <Marker
          position={[incident.location.lat, incident.location.lng]}
          icon={divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: #ef4444;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })}
        >
          <Popup>
            <div className="p-2">
              <p className="font-semibold">{incident.title}</p>
              <p className="text-sm text-slate-500">Lokasi Incident</p>
            </div>
          </Popup>
        </Marker>

        {/* Volunteer Markers */}
        {availableMatches.map((match) => {
          const isSelected = selectedIds.includes(match.volunteer.id);
          const color = isSelected ? '#f59e0b' : '#22c55e'; // amber if selected, green otherwise

          return (
            <Marker
              key={match.volunteer.id}
              position={[
                match.volunteer.location.lat,
                match.volunteer.location.lng,
              ]}
              icon={divIcon({
                className: 'custom-marker',
                html: `
                  <div style="
                    background: ${color};
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
              eventHandlers={{
                click: () => onSelectVolunteer(match.volunteer.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{match.volunteer.name}</p>
                  <p className="text-sm text-slate-500">
                    Jarak: {match.distanceText}
                  </p>
                  <p className="text-sm text-slate-500">
                    Skill Match: {Math.round(match.matchScore)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Klik untuk memilih
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 z-[1000]">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Incident</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Volunteer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Terpilih</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default DispatchMap;