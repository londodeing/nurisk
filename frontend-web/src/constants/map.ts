/**
 * Map Configuration Constants
 */

// =============================================================================
// Default Map Center (Jawa Tengah)
// =============================================================================

export const DEFAULT_MAP_CENTER: [number, number] = [-7.5, 112.5];

// =============================================================================
// Map Configuration
// =============================================================================

export const MAP_CONFIG = {
  defaultCenter: DEFAULT_MAP_CENTER,
  defaultZoom: 10,
  minZoom: 5,
  maxZoom: 18,
  zoomControlPosition: 'bottomright' as const,
  attributionControl: true,
};

// =============================================================================
// Tile Layer Providers
// =============================================================================

export const TILE_LAYERS = {
  OPENSTREETMAP: {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  GOOGLE: {
    id: 'google',
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 20,
  },
  GOOGLE_SATELLITE: {
    id: 'google_satellite',
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 20,
  },
  ESRI: {
    id: 'esri',
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    maxZoom: 18,
  },
  BIDARIS: {
    id: 'bidaris',
    name: 'BIDARIS',
    url: 'https://tile.bidarIS.com/{z}/{x}/{y}.png',
    attribution: '&copy; BIDARIS',
    maxZoom: 18,
  },
} as const;

// =============================================================================
// Default Tile Layer
// =============================================================================

export const DEFAULT_TILE_LAYER = TILE_LAYERS.OPENSTREETMAP;

// =============================================================================
// WMS Layers
// =============================================================================

export const WMS_LAYERS = {
  BMKG_HAZARD: {
    id: 'bmkg_hazard',
    name: 'Zona Bahaya BMKG',
    url: 'https://inatews.bmkg.go.id/geoserver/inatews/ows',
    layers: 'inatews:gempa_terkini,inatews:gempadi',
    styles: '',
    format: 'image/png',
    transparent: true,
  },
  BNPB_HAZARD: {
    id: 'bnpb_hazard',
    name: 'Zona Bahaya BNPB',
    url: 'https://geodata.bnpb.go.id/geoserver/wfs',
    layers: 'bnpb:zona_bahaya',
    styles: '',
    format: 'image/png',
    transparent: true,
  },
} as const;

// =============================================================================
// Marker Icons
// =============================================================================

export const MARKER_ICONS = {
  INCIDENT: {
    default: '📍',
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  },
  SHELTER: {
    default: '🏠',
    available: '✅',
    full: '❌',
  },
  WAREHOUSE: {
    default: '📦',
    truck: '🚚',
  },
  COMMAND_POST: {
    default: '🏢',
    active: '⭐',
  },
  VOLUNTEER: {
    default: '👤',
    available: '✅',
    busy: '⛔',
  },
} as const;

// =============================================================================
// Cluster Configuration
// =============================================================================

export const CLUSTER_CONFIG = {
  maxClusterRadius: 80,
  maxZoom: 15,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16,
};

// =============================================================================
// Heatmap Configuration
// =============================================================================

export const HEATMAP_CONFIG = {
  radius: 25,
  blur: 15,
  maxZoom: 10,
  max: 1.0,
  gradient: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red',
  },
};

// =============================================================================
// Map Bounds (Jawa Tengah)
// =============================================================================

export const MAP_BOUNDS = {
  minLat: -8.5,
  maxLat: -6.5,
  minLng: 110.5,
  maxLng: 114.5,
};

// =============================================================================
// Helper Functions
// =============================================================================

export function isValidMapBounds(lat: number, lng: number): boolean {
  return (
    lat >= MAP_BOUNDS.minLat &&
    lat <= MAP_BOUNDS.maxLat &&
    lng >= MAP_BOUNDS.minLng &&
    lng <= MAP_BOUNDS.maxLng
  );
}

export function clampZoom(zoom: number): number {
  return Math.max(MAP_CONFIG.minZoom, Math.min(MAP_CONFIG.maxZoom, zoom));
}

export function getMarkerIcon(type: keyof typeof MARKER_ICONS, status?: string): string {
  const icons = MARKER_ICONS[type];
  if (!icons) return MARKER_ICONS.INCIDENT.default;
  if (status && icons[status as keyof typeof icons]) {
    return icons[status as keyof typeof icons];
  }
  return icons.default;
}