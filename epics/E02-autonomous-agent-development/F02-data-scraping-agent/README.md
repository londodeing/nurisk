# F02 - Data Scraping Agent

**Feature Goal**: Automate real-time data collection from external sources

**Current Data Sources**:
- intel_news table (5140 existing records from Detik Jateng)
- BMKG earthquake data
- Weather radar data
- Historical disaster patterns

**Scraping Targets**:
1. **News Sources**: Detik Jateng, Kompas Jateng, local news
2. **Government APIs**: BMKG, BNPB, regional disaster agencies
3. **Social Media**: Twitter/X disaster hashtags, Facebook emergency groups
4. **Satellite Data**: NASA, ESA earth observation

**Central Java Filtering** (from mainprd.md):
```js
const JATENG_KEYWORDS = [
  'jateng', 'jawa tengah', 'semarang', 'demak', 'kudus', 'pati',
  'rembang', 'blora', 'grobogan', 'solo', 'sragen', 'wonogiri',
  // ... all 35 regencies
];

const CENTRAL_JAVA_BOUNDS = {
  minLat: -7.9, maxLat: -6.5,
  minLng: 108.7, maxLng: 111.5
};
```

## Tasks:
- T01: Implement News Scraping Pipeline
- T02: Create Government API Monitors
- T03: Develop Social Media Listeners
- T04: Build Satellite Data Integration
