# T01 - Preserve WMS Configuration

**Task**: Migrate all map layers and external integrations

**Detailed Configuration Preservation** (from mainprd.md):

1. **Base Map Configuration**:
```js
// Central Java geographic constants
const CENTER_JATENG = [-7.15, 110.14];
const JATENG_BOUNDS = [[-8.8, 108.3], [-5.4, 111.9]];
const INARISK_WMS_URL = process.env.VITE_INARISK_WMS_URL || "https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms";

// Base tile layers with exact specifications
const baseLayers = {
  tactical: {
    name: "Tactical View (Street)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  },
  satellite: {
    name: "NASA Satellite Recon", 
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
    maxNativeZoom: 17
  },
  hillshade: {
    name: "Tekstur Medan (Hillshade)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
    opacity: 0.3,
    zIndex: 1,
    maxNativeZoom: 15
  }
};
```

2. **InaRISK BNPB WMS Layers** (exact specifications):
```js
const wmsLayers = {
  batas_desa: {
    name: "Batas Desa",
    layers: "raster:Batas_Desa",
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    styles: "raster",
    opacity: 0.5,
    maxNativeZoom: 13
  },
  bahaya_banjir: {
    name: "Bahaya Banjir", 
    layers: "raster:INDEKS_BAHAYA_BANJIR1",
    format: "image/png",
    transparent: true,
    version: "1.1.1", 
    styles: "index_bahaya",
    opacity: 0.5,
    maxNativeZoom: 13
  },
  banjir_bandang: {
    name: "Banjir Bandang",
    layers: "raster:INDEKS_BAHAYA_BANJIRBANDANG1", 
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    styles: "index_bahaya",
    opacity: 0.5,
    maxNativeZoom: 13
  },
  tanah_longsor: {
    name: "Tanah Longsor",
    layers: "raster:INDEKS_BAHAYA_TANAHLONGSOR1",
    format: "image/png", 
    transparent: true,
    version: "1.1.1",
    styles: "index_bahaya",
    opacity: 0.5,
    maxNativeZoom: 13
  },
  cuaca_ekstrim: {
    name: "Cuaca Ekstrim",
    layers: "raster:INDEKS_BAHAYA_CUACAEKSTRIM1",
    format: "image/png",
    transparent: true, 
    version: "1.1.1",
    styles: "index_bahaya",
    opacity: 0.5,
    maxNativeZoom: 13
  },
  kekeringan: {
    name: "Kekeringan", 
    layers: "raster:INDEKS_BAHAYA_KEKERINGAN1",
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    styles: "index_bahaya", 
    opacity: 0.5,
    maxNativeZoom: 13
  },
  gunung_api: {
    name: "Gunung Api",
    layers: "raster:INDEKS_BAHAYA_GUNUNGAPI1",
    format: "image/png",
    transparent: true,
    version: "1.1.1", 
    styles: "index_bahaya",
    opacity: 0.5,
    maxNativeZoom: 13
  }
};
```

3. **GeoJSON Boundary Sources** (with fallback):
```js
const geoJsonSources = [
  {
    name: "Primary Source",
    url: "https://raw.githubusercontent.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/main/GeoJSON/indonesia-38-provinces.geojson",
    priority: 1
  },
  {
    name: "Secondary Source", 
    url: "https://raw.githubusercontent.com/Alf-Anas/batas-administrasi-indonesia/master/provinsi.geojson",
    priority: 2
  },
  {
    name: "CDN Fallback",
    url: "https://cdn.jsdelivr.net/gh/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces@main/GeoJSON/indonesia-38-provinces.geojson", 
    priority: 3
  }
];

// GeoJSON filtering for Central Java
const filterCentralJava = (feature) => {
  const region = feature.properties.region || feature.properties.propinsi;
  return region === 'JAWA TENGAH' || region === 'Jawa Tengah';
};

// Boundary styling
const boundaryStyle = {
  color: '#006432',
  weight: 1.5,
  opacity: 1,
  fillOpacity: 0,
  dashArray: '3'
};
```

4. **Additional Overlay Layers**:
```js
const overlayLayers = {
  himawari: {
    name: "Satelit Himawari-9 (NASA)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Himawari9_AHI_Brightness_Temp_Band13/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    opacity: 0.3,
    maxNativeZoom: 6,
    zIndex: 50,
    attribution: 'NASA GIBS'
  },
  heatmap_incidents: {
    name: "Heatmap Konsentrasi",
    type: "heatmap",
    radius: 40,
    blur: 25, 
    maxZoom: 10,
    gradient: {
      0.4: 'blue',
      0.6: 'cyan', 
      0.7: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    }
  },
  heatmap_historical: {
    name: "Historis (Hotspots)",
    type: "heatmap",
    radius: 30,
    blur: 20,
    fixed_intensity: 0.8
  }
};
```

5. **Leaflet Icon Configuration**:
```js
// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', 
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Incident marker configuration
const statusColors = {
  'REPORTED': '#64748b',
  'VERIFIED': '#3b82f6', 
  'ASSESSMENT': '#eab308',
  'COMMANDED': '#f97316',
  'ACTION': '#22c55e',
  'COMPLETED': '#0f172a'
};

const iconMap = {
  'banjir': 'faucet-drip',
  'banjir bandang': 'cloud-showers-heavy',
  'cuaca ekstrim': 'bolt-lightning',
  'gelombang ekstrim dan abrasi': 'water',
  'gempabumi': 'house-crack', 
  'kebakaran hutan dan lahan': 'fire-flame-curved',
  'kekeringan': 'sun-plant-wilt',
  'letusan gunung api': 'volcano',
  'tanah longsor': 'hill-rockslide',
  'tsunami': 'house-tsunami',
  'likuefaksi': 'house-flood-water-circle-arrow-right',
  'default': 'satellite-dish'
};
```

**Layer Loading Strategy**:
1. Load base maps first (tactical as default)
2. Load WMS layers with error handling and retries
3. Load GeoJSON with fallback sources
4. Initialize heatmaps with incident data
5. Add overlay controls for layer management

**Performance Optimization**:
- Implement tile caching for WMS layers
- Use clustering for incident markers when zoom < 10
- Lazy load overlay layers on demand
- Implement viewport-based data loading

**Error Handling**:
- WMS layer timeout: 30 seconds with 3 retries
- GeoJSON fallback: Try next source on failure
- Offline mode: Use cached tiles when available
- User notification for layer loading failures

**Success Criteria**:
- All 7 WMS layers load within 10 seconds
- 3 base maps switch smoothly without flicker
- GeoJSON boundaries render with correct styling
- Heatmaps display incident concentration accurately
- Layer controls functional with proper grouping
- Performance: Map renders within 3 seconds
- Error recovery: Fallback sources work automatically

**Estimated Time**: 8 hours
