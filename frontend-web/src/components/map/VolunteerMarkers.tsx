import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Users, User, Shield } from 'lucide-react';
import api from '@/services/api';

/**
 * @deprecated Use Volunteer from @nurisk/shared-types/volunteer after API migration
 * This interface maps API response (snake_case) to component props (camelCase)
 */
export interface Volunteer {
  id: string;
  name: string;
  role: 'relawan' | 'field_staff' | 'commander';
  status: 'active' | 'inactive' | 'on_mission';
  phone: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
}

// Role-based icons
const roleIcons = {
  relawan: User,
  field_staff: Users,
  commander: Shield,
};

const roleColors = {
  relawan: '#22c55e', // green
  field_staff: '#3b82f6', // blue
  commander: '#dc2626', // red
};

const statusColors = {
  active: '#22c55e',
  on_mission: '#f97316',
  inactive: '#6b7280',
};

interface VolunteerMarkersProps {
  enabled?: boolean;
}

async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await api.get('/volunteers');
  return res.data.data || [];
}

export function VolunteerMarkers({ enabled = true }: VolunteerMarkersProps) {
  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['volunteers'],
    queryFn: fetchVolunteers,
    refetchInterval: 30000, // 30 seconds
    enabled: enabled,
  });

  if (!enabled || isLoading || !volunteers?.length) return null;

  return (
    <>
      {volunteers.map((volunteer) => (
        <VolunteerMarker key={volunteer.id} volunteer={volunteer} />
      ))}
    </>
  );
}

interface VolunteerMarkerProps {
  volunteer: Volunteer;
}

function VolunteerMarker({ volunteer }: VolunteerMarkerProps) {
  const { name, role, status, phone, latitude, longitude, lastUpdate } = volunteer;
  
  const RoleIcon = roleIcons[role] || User;
  const roleColor = roleColors[role];
  const statusColor = statusColors[status];
  
  const icon = useMemo(() => divIcon({
    className: 'volunteer-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${roleColor};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), [roleColor]);

  const formattedTime = useMemo(() => {
    try {
      return new Date(lastUpdate).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return lastUpdate;
    }
  }, [lastUpdate]);

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: roleColor }}
            >
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span style={{ color: statusColor }} className="capitalize">
                {status.replace('_', ' ')}
              </span>
            </p>
            <p><span className="font-medium">Kontak:</span> {phone}</p>
            <p><span className="font-medium">Update:</span> {formattedTime}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Control component
interface VolunteerControlProps {
  enabled: boolean;
  onToggle: () => void;
  count: number;
}

export function VolunteerControl({ enabled, onToggle, count }: VolunteerControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="volunteer-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="volunteer-toggle" className="flex items-center gap-2 cursor-pointer">
        <Users className="w-4 h-4 text-green-600" />
        <span className="text-sm">Relawan</span>
      </label>
      {enabled && count > 0 && (
        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default VolunteerMarkers;