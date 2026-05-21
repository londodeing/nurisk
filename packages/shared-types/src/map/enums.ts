// Map Enums

// =============================================================================
// Map Layer Type
// =============================================================================

export type MapLayerType =
  | 'BASE'         // Base layer (tiles)
  | 'OVERLAY'      // Overlay layer
  | 'WMS'         // Web Map Service
  | 'GEOJSON'      // GeoJSON layer
  | 'HEATMAP';    // Heatmap

// =============================================================================
// Map Marker Type
// =============================================================================

export type MapMarkerType =
  | 'INCIDENT'      // Incident marker
  | 'VOLUNTEER'     // Volunteer marker
  | 'TEAM'          // Team marker
  | 'SHELTER'       // Shelter marker
  | 'WAREHOUSE'    // Warehouse marker
  | 'EVACUATION'   // Evacuation marker
  | 'CUSTOM';      // Custom marker

// =============================================================================
// Region Type
// =============================================================================

export type RegionType =
  | 'PROVINCE'
  | 'DISTRICT'
  | 'SUB_DISTRICT'
  | 'VILLAGE'

// =============================================================================
// Hazard Risk Level
// =============================================================================

export type HazardRiskLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';