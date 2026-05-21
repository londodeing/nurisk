'use client';

import { useRef } from 'react';
import { MapPin, Users, Truck, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Asset,
  Incident,
  Volunteer,
  EvacuationRoute,
  ExclusionZone,
} from '@/services/awarenessService';

interface LiveMapProps {
  assets: Asset[];
  incidents: Incident[];
  volunteers: Volunteer[];
  evacuationRoutes: EvacuationRoute[];
  exclusionZones: ExclusionZone[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  className?: string;
  onIncidentClick?: (incident: Incident) => void;
  onAssetClick?: (asset: Asset) => void;
  onVolunteerClick?: (volunteer: Volunteer) => void;
}

export function LiveMap({
  assets,
  incidents,
  volunteers,
  evacuationRoutes,
  exclusionZones,
  center = { latitude: -7.2575, longitude: 112.7521 },
  zoom = 12,
  className,
  onIncidentClick,
  onAssetClick,
  onVolunteerClick,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Mark as used to avoid unused variable warnings
  void evacuationRoutes;
  void exclusionZones;
  void center;
  void zoom;

  // For now, render a placeholder map with markers
  // In production, integrate with Leaflet or Mapbox
  return (
    <div
      ref={mapRef}
      className={cn(
        'relative w-full h-full min-h-[400px] bg-slate-100 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="w-8 h-8 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-slate-50">
          +
        </button>
        <button className="w-8 h-8 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-slate-50">
          -
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md z-10">
        <p className="text-xs font-semibold text-slate-700 mb-2">Legenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Incident</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Volunteer</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Aset</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Zona Evakuasi</span>
          </div>
        </div>
      </div>

      {/* Markers */}
      <div className="absolute inset-0">
        {/* Incident Markers */}
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => onIncidentClick?.(incident)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${((incident.location.lng - 112.7) / 0.2) * 100 + 50}%`,
              top: `${((incident.location.lat + 7.3) / 0.05) * 100 + 50}%`,
            }}
          >
            <MapPin className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-700 bg-white px-1 rounded whitespace-nowrap">
              {incident.title}
            </span>
          </button>
        ))}

        {/* Volunteer Markers */}
        {volunteers
          .filter((v) => v.status === 'active')
          .map((volunteer) => (
            <button
              key={volunteer.id}
              onClick={() => onVolunteerClick?.(volunteer)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((volunteer.location.lng - 112.7) / 0.2) * 100 + 50}%`,
                top: `${((volunteer.location.lat + 7.3) / 0.05) * 100 + 50}%`,
              }}
            >
              <Users className="w-5 h-5 text-blue-500 fill-blue-500" />
            </button>
          ))}

        {/* Asset Markers */}
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onAssetClick?.(asset)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((asset.location.lng - 112.7) / 0.2) * 100 + 50}%`,
              top: `${((asset.location.lat + 7.3) / 0.05) * 100 + 50}%`,
            }}
          >
            {asset.type === 'vehicle' ? (
              <Truck className="w-5 h-5 text-green-500 fill-green-500" />
            ) : (
              <Building2 className="w-5 h-5 text-green-500 fill-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Center Marker */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
        }}
      >
        <div className="w-3 h-3 bg-slate-400 rounded-full" />
        <div className="absolute inset-0 w-3 h-3 bg-slate-400/30 rounded-full animate-ping" />
      </div>
    </div>
  );
}

export default LiveMap;