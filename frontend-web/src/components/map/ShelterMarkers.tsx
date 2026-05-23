import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';
import api from '@/services/api';

/**
 * @deprecated Use Shelter from @nurisk/shared-types/shelter after API migration
 * This interface maps API response (snake_case) to component props (camelCase)
 */
export interface Shelter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'almost_full' | 'full';
  contact: string;
  phone: string;
}

// Capacity color coding
function getCapacityColor(capacity: number, occupancy: number): string {
  const percentage = (occupancy / capacity) * 100;
  if (percentage >= 90) return '#dc2626'; // red - full
  if (percentage >= 70) return '#eab308'; // yellow - almost full
  return '#22c55e'; // green - available
}

interface ShelterMarkersProps {
  enabled?: boolean;
}

async function fetchShelters(): Promise<Shelter[]> {
  const res = await api.get('/shelters');
  return res.data.data || [];
}

export function ShelterMarkers({ enabled = true }: ShelterMarkersProps) {
  const { data: shelters, isLoading } = useQuery({
    queryKey: ['shelters', 'list', undefined],
    queryFn: fetchShelters,
    enabled: enabled,
  });

  if (!enabled || isLoading || !shelters?.length) return null;

  return (
    <>
      {shelters.map((shelter) => (
        <ShelterMarker key={shelter.id} shelter={shelter} />
      ))}
    </>
  );
}

interface ShelterMarkerProps {
  shelter: Shelter;
}

function ShelterMarker({ shelter }: ShelterMarkerProps) {
  const { name, location, latitude, longitude, capacity, currentOccupancy, contact: _contact, phone } = shelter;
  
  const color = getCapacityColor(capacity, currentOccupancy);
  const percentage = Math.round((currentOccupancy / capacity) * 100);
  
  const icon = useMemo(() => divIcon({
    className: 'shelter-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), [color]);

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-5 h-5" style={{ color }} />
            <p className="font-semibold text-sm">{name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Lokasi:</span> {location}</p>
            <p>
              <span className="font-medium">Kapasitas:</span>{' '}
              {currentOccupancy}/{capacity} ({percentage}%)
            </p>
            {/* Capacity bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <p><span className="font-medium">Kontak:</span> {phone}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Control component
interface ShelterControlProps {
  enabled: boolean;
  onToggle: () => void;
  count: number;
}

export function ShelterControl({ enabled, onToggle, count }: ShelterControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="shelter-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="shelter-toggle" className="flex items-center gap-2 cursor-pointer">
        <Home className="w-4 h-4 text-blue-600" />
        <span className="text-sm">Posko</span>
      </label>
      {enabled && count > 0 && (
        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// Legend
export function ShelterLegend() {
  return (
    <div className="bg-white/90 rounded-lg p-2 shadow-md">
      <p className="text-xs font-semibold mb-2">Kapasitas</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-xs">Tersedia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
          <span className="text-xs">Hampir Penuh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }} />
          <span className="text-xs">Penuh</span>
        </div>
      </div>
    </div>
  );
}

export default ShelterMarkers;