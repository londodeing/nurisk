# T02 - External API Integration

**Task**: Preserve external data source integrations

**External APIs** (from mainprd.md):
1. **BMKG Earthquakes**: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
2. **RainViewer Radar**: `https://api.rainviewer.com/public/weather-maps.json`
3. **NASA Himawari-9**: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Himawari9_AHI_Brightness_Temp_Band13/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`
4. **Emsifa Regions**: `https://www.emsifa.com/api-wilayah-indonesia/api/`

**Refresh Intervals**:
- BMKG: 5 minutes
- RainViewer: 5 minutes
- Historical data: 5 minutes
- Himawari-9: Real-time tiles

**Error Handling**:
- Fallback for failed API calls
- Cached data when offline
- Retry mechanism with exponential backoff
- User notification for data staleness

**Implementation**:
```js
const apiConfig = {
  bmkg: { url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', interval: 300000 },
  rainviewer: { url: 'https://api.rainviewer.com/public/weather-maps.json', interval: 300000 },
  historical: { url: '/api/historical-data/map', interval: 300000 }
};
```

**Success Criteria**:
- All 4 external APIs functional
- Refresh intervals working
- Error handling implemented
- Fallback mechanisms active
- Performance optimized

**Estimated Time**: 4 hours
