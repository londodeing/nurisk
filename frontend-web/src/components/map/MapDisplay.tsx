import { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore, selectActiveBaseLayer } from '@/stores/map-store';

const CARTO_STREET_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const ARCGIS_SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ARCGIS_SATELLITE_ATTRIBUTION = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

const ARCGIS_HILLSHADE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}';
const ARCGIS_HILLSHADE_ATTRIBUTION = '&copy; Esri &mdash; Source: Esri';

const DEFAULT_CENTER: [number, number] = [-7.5, 112.5];
const DEFAULT_ZOOM = 10;
const MIN_ZOOM = 5;
const MAX_ZOOM = 18;

export interface MapDisplayProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  fullscreen?: boolean;
  showControls?: boolean;
  children?: React.ReactNode;
}

function ActiveBaseLayer() {
  const activeBaseLayer = useMapStore(selectActiveBaseLayer);
  const layerId = activeBaseLayer?.id ?? 'base-street';

  return (
    <>
      {layerId === 'base-street' && (
        <TileLayer url={CARTO_STREET_URL} attribution={CARTO_ATTRIBUTION} />
      )}
      {layerId === 'base-satellite' && (
        <TileLayer url={ARCGIS_SATELLITE_URL} attribution={ARCGIS_SATELLITE_ATTRIBUTION} />
      )}
      {layerId === 'base-hillshade' && (
        <TileLayer url={ARCGIS_HILLSHADE_URL} attribution={ARCGIS_HILLSHADE_ATTRIBUTION} opacity={activeBaseLayer?.opacity ?? 0.3} />
      )}
    </>
  );
}

function HillshadeOverlay() {
  const activeBaseLayer = useMapStore(selectActiveBaseLayer);
  const showHillshade = activeBaseLayer?.id !== 'base-hillshade';
  const hillshadeLayer = useMapStore((s) =>
    s.activeLayers.find((l) => l.id === 'base-hillshade')
  );

  if (!showHillshade) return null;

  return (
    <TileLayer
      url={ARCGIS_HILLSHADE_URL}
      attribution={ARCGIS_HILLSHADE_ATTRIBUTION}
      opacity={hillshadeLayer?.opacity ?? 0.3}
    />
  );
}

function MapViewSync({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);

  useEffect(() => {
    if (center) {
      map.setView(center, zoom ?? DEFAULT_ZOOM);
      setCenter(center);
      if (zoom) setZoom(zoom);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
      setZoom(map.getZoom());
    };
    map.on('moveend', handler);
    return () => { map.off('moveend', handler); };
  }, [map, setCenter, setZoom]);

  return null;
}

export function MapDisplay({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = 'h-full w-full',
  showControls = true,
  children,
}: MapDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const activeBaseLayer = useMapStore(selectActiveBaseLayer);

  const handleToggleFullscreen = useCallback(() => {
    const el = document.getElementById('map-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const baseLayers = [
    { id: 'base-street', label: 'Street', icon: '🗺' },
    { id: 'base-satellite', label: 'Satellite', icon: '🛰' },
    { id: 'base-hillshade', label: 'Hillshade', icon: '⛰' },
  ];

  return (
    <div id="map-container" className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
        zoomControl={false}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <ActiveBaseLayer />
        <HillshadeOverlay />
        <MapViewSync center={center} zoom={zoom} />
        {children}
      </MapContainer>

      {showControls && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1">
          {baseLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              title={layer.label}
              className={`p-2 rounded-lg shadow-md text-sm transition-colors ${
                activeBaseLayer?.id === layer.id
                  ? 'bg-nu-green text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">{layer.icon}</span>
            </button>
          ))}
        </div>
      )}

      {showControls && (
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="absolute top-3 right-3 z-[1000] p-2 bg-white rounded-lg shadow-md hover:bg-slate-100 text-slate-700"
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      )}
    </div>
  );
}

export default MapDisplay;
