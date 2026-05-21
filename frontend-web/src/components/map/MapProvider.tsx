import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import api from '@/services/api';
import { wmsLayersConfig, WmsLayerConfig, WmsLayer } from './WmsOverlay';
import { HeatmapLayer, HeatmapConfig } from './HeatmapLayer';
import { BmkgSeismikLayer } from './BmkgSeismikLayer';
import { useBmkgEarthquakes, BmkgEarthquake } from '@/hooks/use-bmkg';
import type { Incident, PriorityLevel } from '@nurisk/shared-types/incident';

/**
 * Internal render projection for map rendering.
 * Not a canonical domain entity.
 * Derived from shared-types Incident.
 */
export interface MapIncidentProjection {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
}

/**
 * Project canonical Incident to map render projection.
 * Pure function - does not mutate source.
 */
function projectIncidentToMapProjection(incident: Incident): MapIncidentProjection {
  // UI token normalization (PRESENTATIONAL only)
  const severityMap: Record<PriorityLevel, 'low' | 'medium' | 'high' | 'critical'> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  };

  return {
    id: incident.id,
    title: incident.title,
    latitude: incident.location.lat,
    longitude: incident.location.lng,
    status: incident.status,
    severity: severityMap[incident.severity] || 'medium',
    type: incident.type,
  };
}

export interface MapShelter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
}

interface MapContextType {
  incidents: MapIncidentProjection[];
  shelters: MapShelter[];
  selectedIncident: MapIncidentProjection | null;
  setSelectedIncident: (i: MapIncidentProjection | null) => void;
  bounds: LatLngBounds | null;
  setBounds: (b: LatLngBounds | null) => void;
  loading: boolean;
  wmsLayers: WmsLayerConfig[];
  toggleWmsLayer: (id: string) => void;
  setWmsLayerOpacity: (id: string, opacity: number) => void;
  heatmapEnabled: boolean;
  toggleHeatmap: () => void;
  heatmapRadius: number;
  setHeatmapRadius: (r: number) => void;
  heatmapConfig: HeatmapConfig;
  bmkgEnabled: boolean;
  toggleBmkg: () => void;
  earthquakes: BmkgEarthquake[];
  isEarthquakesLoading: boolean;
}

const MapContext = createContext<MapContextType | null>(null);

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}

// Map bounds tracker
function BoundsTracker({ onBoundsChange }: { onBoundsChange?: (bounds: LatLngBounds) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handler = () => {
      onBoundsChange?.(map.getBounds());
    };
    map.on('moveend', handler);
    return () => { map.off('moveend', handler); };
  }, [map, onBoundsChange]);
  
  return null;
}

// Map click handler for creating reports
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Main Map Provider
interface MapProviderProps {
  children: ReactNode;
  onMapClick?: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

export function MapProvider({ children, onMapClick: _onMapClick, onBoundsChange: _onBoundsChange }: MapProviderProps) {
  const [incidents, setIncidents] = useState<MapIncidentProjection[]>([]);
  const [shelters, setShelters] = useState<MapShelter[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<MapIncidentProjection | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [wmsLayers, setWmsLayers] = useState<WmsLayerConfig[]>(wmsLayersConfig);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapRadius, setHeatmapRadius] = useState(25);
  const heatmapConfig: HeatmapConfig = { radius: heatmapRadius };
  const [bmkgEnabled, setBmkgEnabled] = useState(false);
  const { earthquakes, isLoading: isEarthquakesLoading } = useBmkgEarthquakes();

  // Toggle WMS layer visibility
  const toggleWmsLayer = useCallback((id: string) => {
    setWmsLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  // Set WMS layer opacity
  const setWmsLayerOpacity = useCallback((id: string, opacity: number) => {
    setWmsLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, opacity } : layer
    ));
  }, []);

  // Toggle heatmap
  const toggleHeatmap = useCallback(() => {
    setHeatmapEnabled(prev => !prev);
  }, []);

  // Set heatmap radius
  const setHeatmapRadius = useCallback((r: number) => {
    setHeatmapRadius(r);
  }, []);

  // Toggle BMKG seismik
  const toggleBmkg = useCallback(() => {
    setBmkgEnabled(prev => !prev);
  }, []);

  // Fetch map data
  useEffect(() => {
    async function fetchMapData() {
      setLoading(true);
      try {
        const [incidentsRes, sheltersRes] = await Promise.all([
          api.get('/incidents', { params: { status: 'active' } }),
          api.get('/shelters'),
        ]);
        // Explicit projection from canonical Incident to render projection
        const projectedIncidents = (incidentsRes.data.data || []).map(projectIncidentToMapProjection);
        setIncidents(projectedIncidents);
        setShelters(sheltersRes.data.data || []);
      } catch (error) {
        console.error('Map data fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, []);

  const value: MapContextType = {
    incidents,
    shelters,
    selectedIncident,
    setSelectedIncident,
    bounds,
    setBounds,
    loading,
    wmsLayers,
    toggleWmsLayer,
    setWmsLayerOpacity,
    heatmapEnabled,
    toggleHeatmap,
    heatmapRadius,
    setHeatmapRadius,
    heatmapConfig,
    bmkgEnabled,
    toggleBmkg,
    earthquakes,
    isEarthquakesLoading,
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

// Base map component
interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  children: ReactNode;
  onMapClick?: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
  className?: string;
  wmsLayers?: WmsLayerConfig[];
  heatmapEnabled?: boolean;
  heatmapData?: { lat: number; lng: number; intensity?: number }[];
  heatmapConfig?: HeatmapConfig;
  bmkgEnabled?: boolean;
  earthquakes?: BmkgEarthquake[];
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const DEFAULT_ZOOM = 5;

export function BaseMap({ 
  center = INDONESIA_CENTER, 
  zoom = DEFAULT_ZOOM, 
  children,
  onMapClick,
  onBoundsChange,
  className = 'h-full w-full',
  wmsLayers = wmsLayersConfig,
  heatmapEnabled = false,
  heatmapData = [],
  heatmapConfig,
  bmkgEnabled = false,
  earthquakes = [],
}: BaseMapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className={className}
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* WMS layers from InaRISK BNPB */}
      {wmsLayers.filter(l => l.visible).map(layer => (
        <WmsLayer key={layer.id} layer={layer} />
      ))}
      
      {/* Heatmap layer */}
      <HeatmapLayer 
        data={heatmapData} 
        enabled={heatmapEnabled} 
        config={heatmapConfig}
      />
      
      {/* BMKG Seismik layer */}
      <BmkgSeismikLayer 
        earthquakes={earthquakes} 
        enabled={bmkgEnabled} 
      />
      
      <BoundsTracker onBoundsChange={onBoundsChange} />
      <MapClickHandler onMapClick={onMapClick} />
      
      {children}
    </MapContainer>
  );
}

// Legend component
export function MapLegend() {
  const severityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-md text-sm">
      <p className="font-semibold mb-2">Legend</p>
      <div className="space-y-1">
        {Object.entries(severityColors).map(([severity, color]) => (
          <div key={severity} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapProvider;