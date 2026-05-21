import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import api from '@/services/api';

export interface CommandPost {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  commander: string;
  commanderPhone: string;
  status: 'active' | 'inactive' | 'standby';
  type: 'district' | 'village' | 'mobile';
}

const statusColors = {
  active: '#22c55e',
  standby: '#eab308',
  inactive: '#6b7280',
};

const typeColors = {
  district: '#3b82f6',
  village: '#8b5cf6',
  mobile: '#f97316',
};

interface CommandPostMarkersProps {
  enabled?: boolean;
}

async function fetchCommandPosts(): Promise<CommandPost[]> {
  const res = await api.get('/command-posts');
  return res.data.data || [];
}

export function CommandPostMarkers({ enabled = true }: CommandPostMarkersProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['command-posts'],
    queryFn: fetchCommandPosts,
    enabled: enabled,
  });

  if (!enabled || isLoading || !posts?.length) return null;

  return (
    <>
      {posts.map((post) => (
        <CommandPostMarker key={post.id} post={post} />
      ))}
    </>
  );
}

interface CommandPostMarkerProps {
  post: CommandPost;
}

function CommandPostMarker({ post }: CommandPostMarkerProps) {
  const { name, location, latitude, longitude, commander, commanderPhone, status, type } = post;
  
  const color = typeColors[type];
  const statusColor = statusColors[status];
  
  const icon = useMemo(() => divIcon({
    className: 'command-post-marker',
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
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), [color]);

  const typeLabel = {
    district: 'Kecamatan',
    village: 'Desa',
    mobile: 'Bergerak',
  }[type];

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-5 h-5" style={{ color }} />
            <p className="font-semibold text-sm">{name}</p>
          </div>
          <p className="text-xs text-slate-500 mb-2">{typeLabel}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Lokasi:</span> {location}</p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span style={{ color: statusColor }} className="capitalize">
                {status}
              </span>
            </p>
            <p><span className="font-medium">Komandan:</span> {commander}</p>
            <p><span className="font-medium">Kontak:</span> {commanderPhone}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Control component
interface CommandPostControlProps {
  enabled: boolean;
  onToggle: () => void;
  count: number;
}

export function CommandPostControl({ enabled, onToggle, count }: CommandPostControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="command-post-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="command-post-toggle" className="flex items-center gap-2 cursor-pointer">
        <Flag className="w-4 h-4 text-purple-600" />
        <span className="text-sm">Posko</span>
      </label>
      {enabled && count > 0 && (
        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// Legend
export function CommandPostLegend() {
  const types = [
    { type: 'district', label: 'Kecamatan', color: '#3b82f6' },
    { type: 'village', label: 'Desa', color: '#8b5cf6' },
    { type: 'mobile', label: 'Bergerak', color: '#f97316' },
  ];
  
  return (
    <div className="bg-white/90 rounded-lg p-2 shadow-md">
      <p className="text-xs font-semibold mb-2">Tipe Posko</p>
      <div className="space-y-1">
        {types.map((t) => (
          <div key={t.type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: t.color }} />
            <span className="text-xs">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommandPostMarkers;