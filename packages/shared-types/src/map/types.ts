// Map Types - Business Interfaces

import type { GeoLocation } from '../common/types';
import type { MapLayerType, MapMarkerType, RegionType, HazardRiskLevel } from './enums';

// =============================================================================
// Map Layer
// =============================================================================

export interface MapLayer {
  /** Layer ID */
  id: string;
  /** Layer name */
  name: string;
  /** Layer type */
  type: MapLayerType;
  /** URL */
  url?: string;
  /** Attribution */
  attribution?: string;
  /** Is visible */
  visible: boolean;
  /** Opacity (0-1) */
  opacity: number;
  /** Z-index */
  zIndex: number;
  /** Min zoom */
  minZoom?: number;
  /** Max zoom */
  maxZoom?: number;
  /** Style (for WMS) */
  styles?: Record<string, string>;
  /** Layers (for WMS) */
  layers?: string[];
}

// =============================================================================
// Map Marker
// =============================================================================

export interface MapMarker {
  /** Marker ID */
  id: string;
  /** Marker type */
  type: MapMarkerType;
  /** Position */
  position: GeoLocation;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Icon */
  icon?: string;
  /** Color */
  color?: string;
  /** Size */
  size?: number;
  /** Related entity ID */
  relatedEntityId?: string;
  /** Related entity type */
  relatedEntityType?: string;
  /** Data */
  data?: Record<string, unknown>;
}

// =============================================================================
// Map Popup
// =============================================================================

export interface MapPopup {
  /** Popup ID */
  id: string;
  /** Marker ID */
  markerId: string;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Position */
  position: GeoLocation;
}

// =============================================================================
// Map Bounds
// =============================================================================

export interface MapBounds {
  /** North latitude */
  north: number;
  /** East longitude */
  east: number;
  /** South latitude */
  south: number;
  /** West longitude */
  west: number;
}

// =============================================================================
// Map View State
// =============================================================================

export interface MapViewState {
  /** Center latitude */
  centerLat: number;
  /** Center longitude */
  centerLng: number;
  /** Zoom level */
  zoom: number;
  /** Bounds (optional) */
  bounds?: MapBounds;
}

// =============================================================================
// Map Configuration
// =============================================================================

export interface MapConfig {
  /** Default center */
  defaultCenter: GeoLocation;
  /** Default zoom */
  defaultZoom: number;
  /** Min zoom */
  minZoom: number;
  /** Max zoom */
  maxZoom: number;
  /** Max bounds */
  maxBounds?: MapBounds;
  /** Base layers */
  baseLayers: MapLayer[];
  /** Overlay layers */
  overlayLayers: MapLayer[];
}

// =============================================================================
// GeoJSON Types
// =============================================================================

export interface GeoJSONFeature {
  /** Feature ID */
  id?: string;
  /** Feature type */
  type: 'Feature';
  /** Geometry */
  geometry: GeoJSONGeometry;
  /** Properties */
  properties: Record<string, unknown>;
}

export interface GeoJSONGeometry {
  /** Geometry type */
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  /** Coordinates */
  coordinates: number[] | number[][] | number[][][];
}

export interface GeoJSONCollection {
  /** Type */
  type: 'FeatureCollection';
  /** Features */
  features: GeoJSONFeature[];
}

// =============================================================================
// Region
// =============================================================================

export interface Region {
  /** Region ID */
  id: string;
  /** Region name */
  name: string;
  /** Type */
  type: RegionType;
  /** Parent ID */
  parentId?: string;
  /** GeoJSON */
  geometry?: GeoJSONCollection;
}

// =============================================================================
// Hazard Zone
// =============================================================================

export interface HazardZone {
  /** Zone ID */
  id: string;
  /** Hazard type */
  hazardType: string;
  /** Risk level */
  riskLevel: HazardRiskLevel;
  /** Geometry */
  geometry: GeoJSONCollection;
  /** Description */
  description?: string;
}

// =============================================================================
// Map Filter
// =============================================================================

export interface MapFilter {
  /** Filter by marker type */
  markerTypes?: MapMarkerType[];
  /** Filter by disaster type */
  disasterTypes?: string[];
  /** Filter by status */
  statuses?: string[];
  /** Filter by region */
  regionId?: string;
  /** Show only active */
  showOnlyActive?: boolean;
}

// =============================================================================
// Cluster Configuration
// =============================================================================

export interface ClusterConfig {
  /** Enable clustering */
  enabled: boolean;
  /** Cluster radius */
  radius: number;
  /** Max zoom for clustering */
  maxZoom: number;
  /** Show count on cluster */
  showCount: boolean;
  /** Cluster colors */
  colors?: Record<string, string>;
}

// =============================================================================
// Heatmap Point
// =============================================================================

export interface HeatmapPoint {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Intensity (0-1) */
  intensity: number;
  /** Radius in pixels */
  radius: number;
}