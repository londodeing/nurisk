// Report Location Map - isolated Leaflet component with proper lifecycle
import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map center updater - ensures map centers on coordinate changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip initial mount to prevent zoom reset
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
}

interface ReportLocationMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export const ReportLocationMap = memo(function ReportLocationMap({
  latitude,
  longitude,
  onLocationSelect,
}: ReportLocationMapProps) {
  const center: [number, number] = [
    latitude !== 0 ? latitude : -7.5755,
    longitude !== 0 ? longitude : 110.8243,
  ];

  return (
    <div className="h-64 rounded-lg overflow-hidden border mb-4">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onLocationSelect={onLocationSelect} />
        <MapCenterUpdater center={center} />
        {latitude !== 0 && longitude !== 0 && (
          <Marker
            position={[latitude, longitude]}
            icon={divIcon({
              className: 'custom-marker',
              html: '<div style="width:20px;height:20px;background:#ef4444;border:3px solid white;border-radius:50%"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        )}
      </MapContainer>
    </div>
  );
});