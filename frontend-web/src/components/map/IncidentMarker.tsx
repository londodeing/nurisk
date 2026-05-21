import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { divIcon } from 'leaflet';
import type { Incident, PriorityLevel, DisasterType } from '@nurisk/shared-types/incident';

interface IncidentMarkerProps {
  incident: Incident;
  onClick?: (incident: Incident) => void;
}

// Canonical severity colors
const severityColors: Record<PriorityLevel, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

// Disaster type display labels
const typeLabels: Record<DisasterType, string> = {
  BANJIR: 'Banjir',
  LONGSOR: 'Tanah Longsor',
  GEMPA: 'Gempa Bumi',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Gunung Api',
  KEBAKARAN_HUTAN: 'Kebakaran Hutan',
  KEBAKARAN_BANGUNAN: 'Kebakaran Bangunan',
  EKSTREM_CUACA: 'Ekstrem Cuaca',
  WABAH_PENYAKIT: 'Wabah Penyakit',
};

export function IncidentMarker({ incident, onClick }: IncidentMarkerProps) {
  const color = severityColors[incident.severity] || '#6b7280';
  
  const icon = divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  return (
    <Marker
      position={[incident.location.lat, incident.location.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(incident),
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-semibold text-lg mb-1">{incident.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{incident.location.address}</p>
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: color }}
            >
              {incident.severity}
            </span>
            <span className="text-xs text-slate-500">{typeLabels[incident.type]}</span>
          </div>
          <Link 
            to={`/incidents/${incident.id}`}
            className="text-sm text-nu-green hover:underline"
          >
            Lihat Detail →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

interface IncidentMarkerClusterProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
}

export function IncidentMarkerCluster({ incidents, onIncidentClick }: IncidentMarkerClusterProps) {
  return (
    <>
      {incidents.map(incident => (
        <IncidentMarker 
          key={incident.id} 
          incident={incident} 
          onClick={onIncidentClick}
        />
      ))}
    </>
  );
}

export default IncidentMarker;