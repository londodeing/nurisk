import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { AlertTriangle, Waves } from 'lucide-react';
import { BmkgEarthquake } from '@/hooks/use-bmkg';

// Magnitude color coding
function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 3) return '#22c55e'; // green
  if (magnitude < 5) return '#eab308'; // yellow
  if (magnitude < 7) return '#f97316'; // orange
  return '#dc2626'; // red
}

// Circle size based on magnitude
function getMagnitudeRadius(magnitude: number): number {
  if (magnitude < 3) return 8;
  if (magnitude < 5) return 12;
  if (magnitude < 7) return 16;
  return 24;
}

// Depth color coding
function getDepthColor(depth: number): string {
  if (depth < 30) return '#dc2626'; // shallow - red
  if (depth < 70) return '#f97316'; // intermediate - orange
  return '#22c55e'; // deep - green
}

interface BmkgSeismikLayerProps {
  earthquakes?: BmkgEarthquake[];
  enabled?: boolean;
}

export function BmkgSeismikLayer({ 
  earthquakes = [], 
  enabled = true 
}: BmkgSeismikLayerProps) {
  if (!enabled || earthquakes.length === 0) return null;

  return (
    <>
      {earthquakes.map((quake) => (
        <EarthquakeMarker key={quake.id} earthquake={quake} />
      ))}
    </>
  );
}

interface EarthquakeMarkerProps {
  earthquake: BmkgEarthquake;
}

function EarthquakeMarker({ earthquake }: EarthquakeMarkerProps) {
  const { magnitude, depth, location, dateTime, potentialTsunami, lat, lon } = earthquake;
  
  const color = useMemo(() => getMagnitudeColor(magnitude), [magnitude]);
  const radius = useMemo(() => getMagnitudeRadius(magnitude), [magnitude]);
  const depthColor = useMemo(() => getDepthColor(depth), [depth]);
  
  // Format date time
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTime;
    }
  }, [dateTime]);
  
  // Custom marker icon
  const icon = useMemo(() => divIcon({
    className: 'bmkg-marker',
    html: `
      <div style="
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: ${Math.max(8, radius / 2)}px;
        font-weight: bold;
        color: white;
      ">
        ${magnitude.toFixed(1)}
      </div>
    `,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius],
  }), [magnitude, color, radius]);

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              {magnitude.toFixed(1)}
            </div>
            <div>
              <p className="font-semibold text-sm">Gempa Bumi</p>
              <p className="text-xs text-slate-500">{formattedDate}</p>
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Lokasi:</span> {location}</p>
            <p>
              <span className="font-medium">Kedalaman:</span>{' '}
              <span style={{ color: depthColor }}>{depth} km</span>
            </p>
            <p><span className="font-medium">Magnitude:</span> {magnitude.toFixed(1)} SR</p>
            
            {/* Tsunami warning */}
            {potentialTsunami === 'tsunami' && (
              <div className="flex items-center gap-1 text-red-600 mt-2">
                <Waves className="w-4 h-4" />
                <span className="font-medium">POTENSI TSUNAMI</span>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Control component for UI
interface BmkgControlProps {
  enabled: boolean;
  onToggle: () => void;
  count: number;
  isLoading?: boolean;
}

export function BmkgControl({ enabled, onToggle, count, isLoading: _isLoading }: BmkgControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="bmkg-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="bmkg-toggle" className="flex items-center gap-2 cursor-pointer">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        <span className="text-sm">Gempa Bumi</span>
      </label>
      {enabled && count > 0 && (
        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// Legend component
export function BmkgLegend() {
  const levels = [
    { magnitude: '< 3.0', color: '#22c55e', label: 'Ringan' },
    { magnitude: '3.0 - 5.0', color: '#eab308', label: 'Sedang' },
    { magnitude: '5.0 - 7.0', color: '#f97316', label: 'Kuat' },
    { magnitude: '> 7.0', color: '#dc2626', label: 'Sangat Kuat' },
  ];
  
  return (
    <div className="bg-white/90 rounded-lg p-2 shadow-md">
      <p className="text-xs font-semibold mb-2">Magnitude (SR)</p>
      <div className="space-y-1">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: level.color }}
            />
            <span className="text-xs">{level.magnitude}</span>
            <span className="text-xs text-slate-500">({level.label})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BmkgSeismikLayer;