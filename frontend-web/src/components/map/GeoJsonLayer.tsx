import { useEffect, useState, useCallback, useRef, type JSX } from 'react';
import { useMap } from 'react-leaflet';

import api from '@/services/api';
import { useMapStore } from '@/stores/map-store';

const GeoJSONComponent = 'GeoJSON' as unknown as (props: Record<string, unknown>) => JSX.Element;

interface BoundaryStyle {
  color: string;
  weight: number;
  opacity: number;
  fillColor: string;
  fillOpacity: number;
}

interface GeoLayer {
  bindTooltip(content: string, options?: Record<string, unknown>): void;
  openTooltip(): void;
  closeTooltip(): void;
  on(event: string, handler: (ev: Record<string, unknown>) => void): void;
  getBounds(): Record<string, unknown>;
  setStyle(style: BoundaryStyle): void;
  bringToFront(): void;
}

const BOUNDARY_STYLE: BoundaryStyle = {
  color: '#006432',
  weight: 2,
  opacity: 0.8,
  fillColor: '#006432',
  fillOpacity: 0.1,
};

const HIGHLIGHT_STYLE: BoundaryStyle = {
  color: '#006432',
  weight: 3,
  opacity: 1,
  fillColor: '#006432',
  fillOpacity: 0.2,
};

const FALLBACK_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: '3578', name: 'KOTA SURABAYA', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[112.63,-7.15],[112.75,-7.15],[112.78,-7.22],[112.82,-7.28],[112.78,-7.35],[112.72,-7.38],[112.65,-7.35],[112.60,-7.32],[112.58,-7.28],[112.55,-7.22],[112.58,-7.18],[112.63,-7.15]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3579', name: 'KOTA MALANG', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[112.58,-7.88],[112.65,-7.88],[112.68,-7.92],[112.70,-7.96],[112.68,-8.00],[112.63,-8.02],[112.58,-8.00],[112.55,-7.98],[112.53,-7.94],[112.55,-7.90],[112.58,-7.88]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3501', name: 'KABUPATEN PACITAN', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.00,-8.00],[111.20,-8.00],[111.34,-8.10],[111.40,-8.18],[111.35,-8.25],[111.20,-8.30],[111.10,-8.28],[111.02,-8.22],[110.98,-8.15],[110.95,-8.10],[111.00,-8.00]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3502', name: 'KABUPATEN PONOROGO', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.35,-7.78],[111.55,-7.78],[111.65,-7.85],[111.70,-7.92],[111.68,-8.00],[111.60,-8.05],[111.48,-8.08],[111.38,-8.05],[111.30,-8.00],[111.28,-7.92],[111.30,-7.85],[111.35,-7.78]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3503', name: 'KABUPATEN TRENGGALEK', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.55,-8.00],[111.75,-8.00],[111.85,-8.08],[111.88,-8.15],[111.85,-8.22],[111.78,-8.25],[111.65,-8.28],[111.58,-8.22],[111.52,-8.15],[111.50,-8.08],[111.55,-8.00]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3504', name: 'KABUPATEN TULUNGAGUNG', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.75,-7.95],[111.95,-7.95],[112.05,-8.02],[112.10,-8.10],[112.08,-8.18],[112.00,-8.22],[111.88,-8.20],[111.78,-8.18],[111.70,-8.12],[111.68,-8.05],[111.70,-7.98],[111.75,-7.95]]],
      },
    },
    {
      type: 'Feature',
      properties: { id: '3505', name: 'KABUPATEN BLITAR', province: 'JAWA TIMUR' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[111.95,-7.95],[112.15,-7.95],[112.25,-8.02],[112.28,-8.10],[112.25,-8.18],[112.18,-8.22],[112.08,-8.20],[111.98,-8.18],[111.90,-8.12],[111.88,-8.05],[111.90,-7.98],[111.95,-7.95]]],
      },
    },
  ],
};

interface GeoJsonLayerProps {
  visible?: boolean;
  onCityClick?: (cityName: string, properties: Record<string, unknown>) => void;
  onLoad?: (source: 'api' | 'local' | 'fallback') => void;
  onError?: (source: 'api' | 'local' | 'fallback', error: unknown) => void;
}

interface GeoJsonFeatureProperties {
  id?: string;
  name?: string;
  province?: string;
  region?: string;
  [key: string]: unknown;
}

function fetchFromApi(): Promise<GeoJSON.FeatureCollection> {
  return api.get('/map/boundaries').then((res) => {
    const data = res.data;
    if (data?.type === 'FeatureCollection') return data as GeoJSON.FeatureCollection;
    if (data?.data?.type === 'FeatureCollection') return data.data as GeoJSON.FeatureCollection;
    if (Array.isArray(data?.features)) return data as GeoJSON.FeatureCollection;
    if (Array.isArray(data?.data?.features)) return data.data as GeoJSON.FeatureCollection;
    throw new Error('API returned invalid GeoJSON format');
  });
}

function fetchFromLocalFile(): Promise<GeoJSON.FeatureCollection> {
  return fetch('/data/boundaries.json').then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<GeoJSON.FeatureCollection>;
  });
}

function fetchWithFallback(): Promise<{
  data: GeoJSON.FeatureCollection;
  source: 'api' | 'local' | 'fallback';
}> {
  return fetchFromApi()
    .then((data) => ({ data, source: 'api' as const }))
    .catch(() => fetchFromLocalFile()
      .then((data) => ({ data, source: 'local' as const }))
      .catch(() => ({ data: FALLBACK_GEOJSON, source: 'fallback' as const }))
    );
}

export function GeoJsonLayer({
  visible = true,
  onCityClick,
  onLoad,
  onError,
}: GeoJsonLayerProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceLabel, setSourceLabel] = useState<string>('Loading...');
  const geoJsonRef = useRef<Record<string, unknown> | null>(null);
  const map = useMap();
  const layerVisible = useMapStore((s) => s.layerVisibility['batas-kota'] ?? true);

  useEffect(() => {
    let cancelled = false;

    async function loadBoundaries() {
      setLoading(true);
      try {
        const { data, source } = await fetchWithFallback();
        if (cancelled) return;
        setGeoJsonData(data);
        setSourceLabel(source === 'api' ? 'Server' : source === 'local' ? 'Local' : 'Fallback');
        onLoad?.(source);
      } catch (err) {
        if (cancelled) return;
        setGeoJsonData(FALLBACK_GEOJSON);
        setSourceLabel('Fallback');
        onError?.('fallback', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBoundaries();
    return () => { cancelled = true; };
  }, [onLoad, onError]);

  const shouldRender = visible && layerVisible && geoJsonData !== null && !loading;

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: GeoLayer) => {
      const props = feature.properties as GeoJsonFeatureProperties | null;
      const cityName = props?.name ?? 'Unknown';

      layer.bindTooltip(cityName, {
        permanent: false,
        direction: 'center',
        className: 'boundary-tooltip',
        offset: [0, 0],
      });

      layer.on('click', () => {
        onCityClick?.(cityName, props ?? {});
        const bounds = layer.getBounds();
        (map as unknown as { fitBounds: (b: Record<string, unknown>, opts?: Record<string, unknown>) => void }).fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
      });

      layer.on('mouseover', (ev: Record<string, unknown>) => {
        const target = ev.target as GeoLayer;
        target.setStyle(HIGHLIGHT_STYLE);
        target.openTooltip();
        target.bringToFront();
      });

      layer.on('mouseout', (ev: Record<string, unknown>) => {
        const target = ev.target as GeoLayer;
        target.setStyle(BOUNDARY_STYLE);
        target.closeTooltip();
      });
    },
    [onCityClick, map],
  );

  if (loading) {
    return (
      <div className="absolute bottom-16 left-3 z-[1000] bg-white/90 rounded-lg px-2 py-1 text-xs text-slate-500 shadow-sm">
        Loading boundaries...
      </div>
    );
  }

  if (!shouldRender) return null;

  return (
    <>
      <GeoJSONComponent
        key={sourceLabel}
        ref={geoJsonRef}
        data={geoJsonData}
        style={BOUNDARY_STYLE}
        onEachFeature={onEachFeature}
      />
      <div className="absolute bottom-16 left-3 z-[1000] bg-white/90 rounded-lg px-2 py-1 text-xs text-slate-400 shadow-sm">
        Boundaries: {sourceLabel}
      </div>
    </>
  );
}

export default GeoJsonLayer;
