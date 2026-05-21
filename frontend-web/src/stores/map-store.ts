import { create } from 'zustand';

export interface LayerConfig {
  id: string;
  name: string;
  type: 'base' | 'overlay' | 'wms' | 'heatmap';
  source?: string;
  url?: string;
  visible: boolean;
  opacity: number;
}

export interface MapFilters {
  // Incident filters
  status?: string[];
  severity?: string[];
  disasterType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  region?: string[];
  
  // Volunteer filters
  volunteerStatus?: string[];
  role?: string[];
}

export interface MarkerData {
  id: string;
  type: 'incident' | 'volunteer' | 'shelter' | 'warehouse';
  position: [number, number]; // [lat, lng]
  title: string;
  description?: string;
  status?: string;
  severity?: string;
  data?: Record<string, unknown>;
}

// Default map center (Indonesia)
const DEFAULT_CENTER: [number, number] = [-0.7893, 113.9213];
const DEFAULT_ZOOM = 5;

// Default layers configuration
export const DEFAULT_LAYERS: LayerConfig[] = [
  {
    id: 'base-street',
    name: 'Street Map',
    type: 'base',
    source: 'cartodb',
    visible: true,
    opacity: 1,
  },
  {
    id: 'base-satellite',
    name: 'Satellite',
    type: 'base',
    source: 'arcgis',
    visible: false,
    opacity: 1,
  },
  {
    id: 'base-hillshade',
    name: 'Hillshade',
    type: 'base',
    source: 'arcgis',
    visible: false,
    opacity: 0.3,
  },
  {
    id: 'batas-kota',
    name: 'Batas Kota/Kabupaten',
    type: 'overlay',
    visible: true,
    opacity: 0.7,
  },
  {
    id: 'wms-bnpb',
    name: 'InaRISK',
    type: 'wms',
    url: 'https://gis.bnpb.go.id/arcgis/services/RiskIndex/MapServer/WMSServer',
    visible: false,
    opacity: 0.6,
  },
  {
    id: 'radar',
    name: 'Radar Hujan',
    type: 'wms',
    url: 'https://rainviewer.com/api',
    visible: false,
    opacity: 0.5,
  },
  {
    id: 'seismik',
    name: 'Seismik Aktif',
    type: 'overlay',
    source: 'bmkg',
    visible: true,
    opacity: 0.8,
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    type: 'heatmap',
    visible: false,
    opacity: 0.6,
  },
];

interface MapState {
  // === State ===
  // Map position
  center: [number, number];
  zoom: number;
  
  // Layers
  activeLayers: LayerConfig[];
  layerVisibility: Record<string, boolean>;
  
  // Filters
  filters: MapFilters;
  
  // Selection
  selectedIncident: string | null;
  selectedMarker: MarkerData | null;
  
  // Map options
  heatmapEnabled: boolean;
  clusteringEnabled: boolean;
  
  // Loading states
  loading: boolean;
  error: string | null;

  // === Actions ===
  // Map position actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  panTo: (center: [number, number], zoom?: number) => void;
  
  // Layer actions
  toggleLayer: (layerId: string) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setActiveLayers: (layers: LayerConfig[]) => void;
  
  // Filter actions
  setFilters: (filters: Partial<MapFilters>) => void;
  clearFilters: () => void;
  
  // Selection actions
  selectIncident: (incidentId: string | null) => void;
  selectMarker: (marker: MarkerData | null) => void;
  clearSelection: () => void;
  
  // Map option actions
  toggleHeatmap: () => void;
  toggleClustering: () => void;
  
  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetMap: () => void;
}

export const useMapStore = create<MapState>()((set, get) => ({
  // === Initial State ===
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  activeLayers: DEFAULT_LAYERS,
  layerVisibility: DEFAULT_LAYERS.reduce((acc, layer) => {
    acc[layer.id] = layer.visible;
    return acc;
  }, {} as Record<string, boolean>),
  filters: {},
  selectedIncident: null,
  selectedMarker: null,
  heatmapEnabled: false,
  clusteringEnabled: false,
  loading: false,
  error: null,

  // === Map Position Actions ===
  setCenter: (center) => set({ center }),
  
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 3), 18) }),
  
  panTo: (center, zoom) => set({ 
    center, 
    zoom: zoom ?? get().zoom 
  }),

  // === Layer Actions ===
  toggleLayer: (layerId) => {
    const { layerVisibility, activeLayers } = get();
    const newVisibility = !layerVisibility[layerId];
    
    set({
      layerVisibility: { ...layerVisibility, [layerId]: newVisibility },
      activeLayers: activeLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible: newVisibility } : layer
      ),
    });
  },
  
  setLayerVisibility: (layerId, visible) => {
    const { layerVisibility, activeLayers } = get();
    
    set({
      layerVisibility: { ...layerVisibility, [layerId]: visible },
      activeLayers: activeLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      ),
    });
  },
  
  setLayerOpacity: (layerId, opacity) => {
    const { activeLayers } = get();
    
    set({
      activeLayers: activeLayers.map(layer =>
        layer.id === layerId ? { ...layer, opacity } : layer
      ),
    });
  },
  
  setActiveLayers: (layers) => {
    set({
      activeLayers: layers,
      layerVisibility: layers.reduce((acc, layer) => {
        acc[layer.id] = layer.visible;
        return acc;
      }, {} as Record<string, boolean>),
    });
  },

  // === Filter Actions ===
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  clearFilters: () => set({ filters: {} }),

  // === Selection Actions ===
  selectIncident: (incidentId) => set({ 
    selectedIncident: incidentId,
    selectedMarker: incidentId ? get().selectedMarker : null,
  }),
  
  selectMarker: (marker) => set({ 
    selectedMarker: marker,
    selectedIncident: marker?.type === 'incident' ? marker.id : null,
  }),
  
  clearSelection: () => set({ 
    selectedIncident: null,
    selectedMarker: null,
  }),

  // === Map Option Actions ===
  toggleHeatmap: () => {
    const { heatmapEnabled, activeLayers } = get();
    const newValue = !heatmapEnabled;
    
    set({
      heatmapEnabled: newValue,
      activeLayers: activeLayers.map(layer =>
        layer.id === 'heatmap' ? { ...layer, visible: newValue } : layer
      ),
    });
  },
  
  toggleClustering: () => set({ clusteringEnabled: !get().clusteringEnabled }),

  // === State Actions ===
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  resetMap: () => set({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    activeLayers: DEFAULT_LAYERS,
    layerVisibility: DEFAULT_LAYERS.reduce((acc, layer) => {
      acc[layer.id] = layer.visible;
      return acc;
    }, {} as Record<string, boolean>),
    filters: {},
    selectedIncident: null,
    selectedMarker: null,
    heatmapEnabled: false,
    clusteringEnabled: false,
    loading: false,
    error: null,
  }),
}));

// === Selectors ===
export const selectVisibleLayers = (state: MapState) =>
  state.activeLayers.filter(layer => layer.visible);

export const selectActiveBaseLayer = (state: MapState) =>
  state.activeLayers.find(layer => layer.type === 'base' && layer.visible);

export const selectOverlayLayers = (state: MapState) =>
  state.activeLayers.filter(layer => layer.type === 'overlay' && layer.visible);

export default useMapStore;