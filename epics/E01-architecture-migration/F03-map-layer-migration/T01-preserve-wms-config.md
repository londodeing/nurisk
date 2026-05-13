# T01 - Preserve WMS Configuration

**Task**: Migrate all map layers and external integrations

**Current Configuration**:
- InaRISK BNPB WMS: 7 disaster layers
- Base maps: 3 tile layers (Tactical, Satellite, Hillshade)
- GeoJSON: Central Java boundaries (3 fallback sources)
- External APIs: BMKG earthquakes, RainViewer radar

**WMS Layers to Preserve**:
```js
const wmsLayers = {
  'Batas Desa': 'raster:Batas_Desa',
  'Bahaya Banjir': 'raster:INDEKS_BAHAYA_BANJIR1',
  'Banjir Bandang': 'raster:INDEKS_BAHAYA_BANJIRBANDANG1',
  'Tanah Longsor': 'raster:INDEKS_BAHAYA_TANAHLONGSOR1',
  'Cuaca Ekstrim': 'raster:INDEKS_BAHAYA_CUACAEKSTRIM1',
  'Kekeringan': 'raster:INDEKS_BAHAYA_KEKERINGAN1',
  'Gunung Api': 'raster:INDEKS_BAHAYA_GUNUNGAPI1'
};
```

**Success Criteria**:
- All 7 WMS layers functional
- 3 base maps working
- GeoJSON boundaries loading
- External API integration preserved
- Central Java bounds: [[-8.8, 108.3], [-5.4, 111.9]]

**Estimated Time**: 4 hours
