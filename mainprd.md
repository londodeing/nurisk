# NURisk — Data Migration Reference for Rebuild

**Project**: PUSDATIN NU Peduli Jawa Tengah — NURisk
**Purpose**: Complete data reference extracted from existing `/backend` and `/frontend` for rebuild fidelity
**Date**: 2026-05-13

---

## 1. WMS & Map Layer Configuration (from MapDisplay.jsx)

### 1.1 Base Configuration
```js
const CENTER_JATENG = [-7.15, 110.14];
const JATENG_BOUNDS = [[-8.8, 108.3], [-5.4, 111.9]];
const INARISK_WMS_URL = process.env.VITE_INARISK_WMS_URL || "https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms";
```

### 1.2 Base Map Layers
| Name | URL | Type |
|------|-----|------|
| Tactical View (Street) | `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png` | TileLayer |
| NASA Satellite Recon | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | TileLayer (maxNativeZoom=17) |
| Tekstur Medan (Hillshade) | `https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}` | TileLayer (opacity=0.3, zIndex=1, maxNativeZoom=15) |

### 1.3 WMS Overlay Layers (InaRISK BNPB)
| Name | Layer Name | Format | Style | Opacity |
|------|-----------|--------|-------|---------|
| Batas Desa | `raster:Batas_Desa` | image/png | raster | 0.5 |
| Bahaya Banjir | `raster:INDEKS_BAHAYA_BANJIR1` | image/png | index_bahaya | 0.5 |
| Banjir Bandang | `raster:INDEKS_BAHAYA_BANJIRBANDANG1` | image/png | index_bahaya | 0.5 |
| Tanah Longsor | `raster:INDEKS_BAHAYA_TANAHLONGSOR1` | image/png | index_bahaya | 0.5 |
| Cuaca Ekstrim | `raster:INDEKS_BAHAYA_CUACAEKSTRIM1` | image/png | index_bahaya | 0.5 |
| Kekeringan | `raster:INDEKS_BAHAYA_KEKERINGAN1` | image/png | index_bahaya | 0.5 |
| Gunung Api | `raster:INDEKS_BAHAYA_GUNUNGAPI1` | image/png | index_bahaya | 0.5 |

All WMS: WMS version 1.1.1, transparent=true, maxNativeZoom=13

### 1.4 Additional Overlays
| Name | URL | Type | Properties |
|------|-----|------|-----------|
| Batas Kota/Kabupaten | GeoJSON dari GitHub (3 sources fallback) | GeoJSON | filter: `region === 'JAWA TENGAH' \|\| propinsi === 'JAWA TENGAH'`, color=#006432, weight=1.5, dashArray='3' |
| Satelit Himawari-9 (NASA) | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Himawari9_AHI_Brightness_Temp_Band13/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png` | TileLayer | opacity=0.3, maxNativeZoom=6, zIndex=50 |
| Heatmap Konsentrasi | Leaflet.heat (from `incidents` prop) | HeatmapLayer | radius=40, blur=25, maxZoom=10 |
| Historis (Hotspots) | Leaflet.heat (from `historicalHotspots`) | HeatmapLayer | fixed_intensity=0.8 |

### 1.5 GeoJSON Sources (for regency boundaries)
```js
const geoJsonSources = [
  'https://raw.githubusercontent.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/main/GeoJSON/indonesia-38-provinces.geojson',
  'https://raw.githubusercontent.com/Alf-Anas/batas-administrasi-indonesia/master/provinsi.geojson',
  'https://cdn.jsdelivr.net/gh/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces@main/GeoJSON/indonesia-38-provinces.geojson'
];
```

### 1.6 External Data Sources
| Source | URL | Data | Refresh |
|--------|-----|------|---------|
| BMKG Earthquakes | `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` | Earthquake list | 5 min |
| RainViewer Radar | `https://api.rainviewer.com/public/weather-maps.json` | Radar past time | 5 min |
| Historical Map Data | `GET /api/historical-data/map` | Backend historical | 5 min |

### 1.7 Leaflet Configuration
```js
// Icon factory default fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
```

### 1.8 Incident Marker Configuration
```js
const statusColors = {
  'REPORTED': '#64748b', 'VERIFIED': '#3b82f6', 'ASSESSMENT': '#eab308',
  'COMMANDED': '#f97316', 'ACTION': '#22c55e', 'COMPLETED': '#0f172a'
};

const iconMap = {
  'banjir': 'faucet-drip', 'banjir bandang': 'cloud-showers-heavy',
  'cuaca ekstrim': 'bolt-lightning', 'gelombang ekstrim dan abrasi': 'water',
  'gempabumi': 'house-crack', 'kebakaran hutan dan lahan': 'fire-flame-curved',
  'kekeringan': 'sun-plant-wilt', 'letusan gunung api': 'volcano',
  'tanah longsor': 'hill-rockslide', 'tsunami': 'house-tsunami',
  'likuefaksi': 'house-flood-water-circle-arrow-right',
  'default': 'satellite-dish'
};
```

---

## 2. RBAC (Role-Based Access Control) Data

### 2.1 Role Definitions
| Role | Level | Description | Secret Key Required |
|------|-------|-------------|-------------------|
| `SUPER_ADMIN` | 100 | Full system access | PWNU key |
| `ADMIN_PWNU` | 90 | Province-level admin | PWNU key |
| `PWNU` | 85 | PWNU staff | PWNU key |
| `STAFF_PWNU` | 80 | PWNU operational staff | PWNU key |
| `COMMANDER` | 75 | Operation commander | PWNU key |
| `ADMIN_PCNU` | 70 | Regency-level admin | PCNU key |
| `STAFF_PCNU` | 60 | PCNU staff | PCNU key |
| `FIELD_STAFF` | 50 | Field operator | None |
| `RELAWAN` | 40 | Volunteer | None |
| `PUBLIC` | 10 | Public user | None |

### 2.2 Secret Key Configuration
```js
// From auth_controller.js (with .env overrides)
const serverKeyPWNU = process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS";
const serverKeyPCNU = process.env.SECRET_KEY_PCNU || "PCNU_JATENG_MEMBER";

const roleRequirement = {
  'ADMIN_PWNU': serverKeyPWNU,
  'PWNU': serverKeyPWNU,
  'ADMIN_PCNU': serverKeyPCNU,
  'STAFF_PWNU': serverKeyPWNU,
  'STAFF_PCNU': serverKeyPCNU
  // RELAWAN and FIELD_STAFF don't need secret_key
};
```

### 2.3 JWT Configuration
```js
const JWT_SECRET = process.env.JWT_SECRET || 'PUSDATIN_JATENG_SECRET_2024';
const TOKEN_EXPIRY = '24h';

// JWT Payload
{ id: user.id, role: user.role, region: user.region }
```

### 2.4 RBAC Rules (from controllers)
| Resource | Allowed Roles | Scope |
|----------|--------------|-------|
| Audit logs | SUPER_ADMIN, ADMIN_PWNU | All |
| Emergency broadcast | PWNU only | All |
| Emergency alerts | ADMIN_PWNU, SUPER_ADMIN | Province |
| Chat broadcast | PWNU only | By role/region |
| All incidents | PWNU, SUPER_ADMIN, ADMIN_PWNU, COMMANDER, STAFF_PWNU | All regions |
| Incidents (read) | ADMIN_PCNU, STAFF_PCNU, FIELD_STAFF, RELAWAN | Own region only |
| Volunteers (PCNU) | ADMIN_PCNU | Own region only |
| Nearby volunteers | FIELD_STAFF, RELAWAN | By expertise |
| Public routes | PUBLIC (no auth) | N/A |

### 2.5 Auth Middleware Logic
```js
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded.id || !decoded.role) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }
  req.user = decoded;
  next();
};
```

### 2.6 Registration Validation
```js
// Required fields: username, password, full_name, region
// Password: bcrypt with salt rounds=10
// Username: lowercased and trimmed
```

---

## 3. Administrative Regions of Central Java

### 3.1 Complete Kabupaten/Kota List (35 + 1)
Source: `frontend/src/utils/constants.js` — `KAB_JATENG` array (31 entries, partial) + `backend/src/utils/scraper.js` — `JATENG_KEYWORDS` (33 entries)

Official 35 kabupaten/kota + 1 (Solo is within Sukoharjo/Karanganyar/Sragen/Klaten, in the codebase it's treated separately):

**Kabupaten** (29):
1. Banjarnegara
2. Banyumas
3. Batang
4. Blora
5. Boyolali
6. Brebes
7. Cilacap
8. Demak
9. Grobogan
10. Jepara
11. Karanganyar
12. Kebumen
13. Kendal
14. Klaten
15. Kudus
16. Magelang
17. Pati
18. Pekalongan
19. Pemalang
20. Purbalingga
21. Purworejo
22. Rembang
23. Semarang
24. Sragen
25. Sukoharjo
26. Tegal
27. Temanggung
28. Wonogiri
29. Wonosobo

**Kota** (6):
1. Kota Magelang
2. Kota Pekalongan
3. Kota Salatiga
4. Kota Semarang
5. Kota Surakarta (Solo)
6. Kota Tegal

### 3.2 Volcano Locations (with coordinates)
Source: `backend/src/utils/scraper.js`

| Volcano | Code | Lat | Lng | Primary Regency |
|---------|------|-----|-----|-----------------|
| Merapi | MER | -7.540 | 110.446 | Magelang |
| Semeru | SMR | -8.108 | 112.922 | Lumajang |
| Slamet | SLA | -7.242 | 109.208 | Pemalang |
| Dieng | DIE | -7.200 | 109.920 | Banjarnegara |
| Sumbing | SBG | -7.384 | 110.070 | Temanggung |
| Sundoro | SUN | -7.300 | 109.992 | Wonosobo |

### 3.3 Region Coordinates for Scraper Detection
Source: `backend/src/utils/scraper.js`
```js
const JATENG_COORDS = {
    "Semarang": { lat: -6.99, lng: 110.42, primary_regency: "Semarang" },
    "Demak": { lat: -6.89, lng: 110.63, primary_regency: "Demak" },
    "Merapi": { lat: -7.540, lng: 110.446, primary_regency: "Magelang" },
    "Slamet": { lat: -7.242, lng: 109.208, primary_regency: "Pemalang" },
    "Dieng": { lat: -7.200, lng: 109.920, primary_regency: "Banjarnegara" },
    "Sumbing": { lat: -7.384, lng: 110.070, primary_regency: "Temanggung" },
    "Sindoro": { lat: -7.300, lng: 109.992, primary_regency: "Wonosobo" },
    "Semeru": { lat: -8.108, lng: 112.922, primary_regency: "Lumajang" }
};
```

### 3.4 Central Java Bounding Box
```js
const CENTRAL_JAVA_BOUNDS = {
    minLat: -7.9, maxLat: -6.5,
    minLng: 108.7, maxLng: 111.5
};

const CENTER_JATENG = [-7.15, 110.14];
const JATENG_BOUNDS = [[-8.8, 108.3], [-5.4, 111.9]];
```

### 3.5 Scraper Keywords for Central Java Detection
Source: `backend/src/utils/scraper.js`
```js
const JATENG_KEYWORDS = [
  'jateng', 'jawa tengah', 'semarang', 'demak', 'kudus', 'pati',
  'rembang', 'blora', 'grobogan', 'solo', 'sragen', 'wonogiri',
  'klaten', 'boyolali', 'karanganyar', 'sragen', 'pekalongan',
  'banyumas', 'cilacap', 'purbalingga', 'banjarnegara', 'kebumen',
  'magelang', 'wonosobo', 'temanggung', 'salatiga', 'Kendal',
  'batang', 'pemalang', 'tegal', 'brebes'
];
```

### 3.6 Kecamatan Data
The database does NOT have a dedicated kecamatan/desa reference table. Kecamatan and desa are stored as free-text fields in:
- `volunteers.district` — varchar(100)
- `volunteers.village` — varchar(100)
- `incidents.kecamatan` — varchar(100)
- `incidents.desa` — varchar(100)
- `building_assessments` — alamat TEXT (address, full text)

The frontend uses emsifa API for region cascading dropdown:
```js
// From Assessment.jsx and PersonnelPortal.jsx
// Regency: https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json
// District: https://www.emsifa.com/api-wilayah-indonesia/api/regencies/{provinceId}.json
// Village: https://www.emsifa.com/api-wilayah-indonesia/api/districts/{districtId}.json
```

---

## 4. Database Reference (nuriskanyar.sql)

**Location**: `C:\nurisk\backend\nuriskanyar.sql`
**Size**: 1,923,455 bytes
**Dump Tool**: pg_dump v18.1
**Database**: pusdatin_nu
**Schema**: public

### 4.1 Complete Table List (35 tables)

#### Core Tables (auto-migrated in server.js)
```sql
-- incidents (27+ columns) - Main incident records
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255), disaster_type VARCHAR(100),
    latitude DECIMAL(10,8), longitude DECIMAL(11,8),
    status VARCHAR(50) DEFAULT 'REPORTED',
    region VARCHAR(100), affected_people INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    description TEXT, source_url TEXT,
    priority_score INTEGER DEFAULT 0,
    priority_level VARCHAR(50) DEFAULT 'LOW',
    damage_score INTEGER DEFAULT 0, needs_score INTEGER DEFAULT 0,
    has_shelter BOOLEAN DEFAULT FALSE,
    kecamatan VARCHAR(100), desa VARCHAR(100),
    needs_numeric JSONB DEFAULT '{}',
    reporter_name VARCHAR(255), whatsapp_number VARCHAR(50),
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_data TEXT,
    dampak_manusia JSONB DEFAULT '{}',
    dampak_rumah JSONB DEFAULT '{}',
    dampak_fasum JSONB DEFAULT '{}',
    dampak_vital JSONB DEFAULT '{}',
    dampak_lingkungan JSONB DEFAULT '{}'
);

-- users (7 columns) - Auth & role management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255), username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'RELAWAN',
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- volunteers (17 columns) - Volunteer profiles
CREATE TABLE IF NOT EXISTS volunteers (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255), phone VARCHAR(50),
    birth_date DATE, gender VARCHAR(20), blood_type VARCHAR(5),
    regency VARCHAR(100), district VARCHAR(100), village VARCHAR(100),
    detail_address TEXT,
    latitude DECIMAL(10,8), longitude DECIMAL(11,8),
    medical_history TEXT, expertise TEXT, experience TEXT,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- building_assessments (30+ columns) - Building vulnerability
CREATE TABLE IF NOT EXISTS building_assessments ( ... );
-- audit_logs (7 columns) - Audit trail
CREATE TABLE IF NOT EXISTS audit_logs ( ... );
-- historical_disasters (7 columns) - Time-series disaster data
CREATE TABLE IF NOT EXISTS historical_disasters (
    id SERIAL PRIMARY KEY, region VARCHAR(100) NOT NULL,
    disaster_type VARCHAR(100) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    latitude DECIMAL(10,8), longitude DECIMAL(11,8),
    time VARCHAR(10) DEFAULT '00:00'
);
```

#### Extended Tables (from src/app.js migration — 18+ tables)
```sql
-- volunteer_deployments - Deployment assignments
CREATE TABLE volunteer_deployments (
    id SERIAL PRIMARY KEY, incident_id INTEGER REFERENCES incidents(id),
    volunteer_id INTEGER REFERENCES volunteers(id),
    status VARCHAR(50) DEFAULT 'pending',
    available_from TIMESTAMP, available_until TIMESTAMP,
    note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- incident_instructions - Surat Perintah Tugas
CREATE TABLE incident_instructions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER UNIQUE REFERENCES incidents(id),
    nomor_sp VARCHAR(100) UNIQUE, pj_nama VARCHAR(255),
    pic_lapangan VARCHAR(255), tim_anggota TEXT,
    armada_detail TEXT, peralatan_detail TEXT,
    duration VARCHAR(100), created_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- incident_actions - Field action logs
CREATE TABLE incident_actions (
    id SERIAL PRIMARY KEY, incident_id INTEGER REFERENCES incidents(id),
    kluster VARCHAR(100), nama_kegiatan TEXT,
    jumlah_paket VARCHAR(100), penerima_manfaat VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- shelters - Posko management
CREATE TABLE shelters (
    id SERIAL PRIMARY KEY, incident_id INTEGER REFERENCES incidents(id),
    name VARCHAR(255), region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AKTIF', score INTEGER DEFAULT 100,
    refugee_count INTEGER DEFAULT 0, stock_status VARCHAR(100) DEFAULT 'AMAN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- volunteer_schedules, certifications, asset_inventories, asset_transactions,
-- chat_conversations, chat_messages, team_messages, historical_disasters,
-- logistics_requests, notifications, volunteer_performance
```

#### Additional Tables (from nuriskanyar.sql dump — not in auto-migration)
```sql
-- actions - Generic action records
-- assessments - Assessment records
-- attachments - File attachments
-- command_posts - Command post locations
-- deployments - Deployment records
-- incident_evidence - Evidence photos/documents
-- incident_logs - Incident timeline logs
-- incident_media - Media files
-- incident_resources - Resource allocation
-- incident_skill_requirements - Required skills
-- intel_news (5140 rows) - Scraped news articles
-- inventory (4 rows) - Inventory items
-- master_incidents - Master incident reference
-- news - News feed
-- organizations - Organizational hierarchy (self-referencing parent_id FK)
-- reports - Public reports
-- volunteer_details - Extended volunteer info
-- volunteer_devices - FCM device tokens
-- volunteer_locations - GPS location history
-- warehouses - Warehouse locations
```

### 4.2 Existing Indexes
```sql
CREATE INDEX idx_actions_incident ON actions(incident_id);
CREATE INDEX idx_assessments_incident ON assessments(incident_id);
CREATE INDEX idx_deployments_incident ON deployments(incident_id);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_historical_region_lower ON historical_disasters(LOWER(region));
CREATE INDEX idx_historical_type_lower ON historical_disasters(LOWER(disaster_type));
CREATE INDEX idx_incidents_region_lower ON incidents(LOWER(region));
CREATE INDEX idx_incidents_type_lower ON incidents(LOWER(disaster_type));
```

### 4.3 Database Constraints
All FK relationships:
- `volunteers.user_id` → `users.id`
- `volunteer_deployments.incident_id` → `incidents.id`
- `volunteer_deployments.volunteer_id` → `volunteers.id`
- `incident_instructions.incident_id` → `incidents.id`
- `incident_actions.incident_id` → `incidents.id`
- `shelters.incident_id` → `incidents.id`
- `chat_conversations.incident_id` → `incidents.id`
- `chat_messages.conversation_id` → `chat_conversations.id`
- `chat_messages.sender_id` → `users.id`
- `asset_transactions.asset_id` → `asset_inventories.id`
- `asset_transactions.incident_id` → `incidents.id`
- `organizations.parent_id` → `organizations.id`
- `notifications.incident_id` → `incidents.id`
- `volunteer_performance.volunteer_id` → `volunteers.id`
- `volunteer_performance.incident_id` → `incidents.id`
- `certifications.volunteer_id` → `volunteers.id`
- `volunteer_schedules.volunteer_id` → `volunteers.id`
- `volunteer_devices.volunteer_id` → `volunteers.id`

Unique constraints: `users.username`, `asset_inventories.qr_code`, `incident_instructions.nomor_sp`, `intel_news.url`, `reports.report_code`, `volunteer_devices.token`

### 4.4 Existing Seed Data (from dump)
**Users** (27 rows):
- `admin` — ADMIN_PWNU, Jawa Tengah
- `cobapw`, `adminpwnu`, `pusattest` — ADMIN_PWNU, Semarang
- `adminkudus`, `kuduscoba` — ADMIN_PCNU, Kudus
- `relacoba`, `cobarela` — RELAWAN, various regions
- `safflap`, `cobafield`, `fieldkds` — FIELD_STAFF, various regions
- `superadmin` — STAFF_PWNU, Semarang
- `cobapc` — STAFF_PCNU, Kudus

**Volunteers** (3 rows): field data with expertise (SAR, Assessment)

**Incidents** (44 rows): Mixed AI-generated and manual reports

**Intel News** (5140 rows): Scraped from Detik Jateng

**Historical Disasters** (12641 rows): Time-series disaster records (id_seq=12641)

**Inventory** (4 rows): Ambulans MWC NU (3 unit), Tenda Pengungsian (10 set), Gedung PCNU, mukhlisin (Personil)

### 4.5 Sequence Values
| Sequence | Current Value |
|----------|--------------|
| incidents_id_seq | 44 |
| intel_news_id_seq | 5140 |
| historical_disasters_id_seq | 12641 |
| users_id_seq | 27 |
| volunteers_id_seq | 3 |
| inventory_id_seq | 4 |
| building_assessments_id_seq | 7 |
| incident_instructions_id_seq | 3 |
| incident_logs_id_seq | 59 |
| incident_actions_id_seq | 2 |
| asset_inventories_id_seq | 5 |
| volunteer_locations_id_seq | 1 |

---

## 5. Disaster Types & Constants

### 5.1 Disaster Types (11 types)
Source: `frontend/src/utils/constants.js`
```js
const DISASTER_TYPES = [
  "Banjir", "Banjir Bandang", "Cuaca Ekstrim",
  "Gelombang Ekstrim dan Abrasi", "Gempabumi",
  "Kebakaran Hutan dan Lahan", "Kekeringan",
  "Letusan Gunung Api", "Tanah Longsor",
  "Tsunami", "Likuefaksi"
];
```

### 5.2 Need Categories
Source: `frontend/src/utils/constants.js`
```js
const NEED_CATEGORIES = [
  { id: 'sembako', label: 'Sembako', unit: 'Paket' },
  { id: 'selimut', label: 'Selimut/Tikar', unit: 'Pcs' },
  { id: 'medis', label: 'Obat-obatan', unit: 'Paket' },
  { id: 'bayi', label: 'Susu & Popok', unit: 'Paket' },
  { id: 'air', label: 'Air Bersih', unit: 'Tangki' },
];
```

### 5.3 Incident Status Flow
```js
const STATUS_FLOW = [
  'REPORTED', 'VERIFIED', 'ASSESSED', 'COMMANDED', 'ACTION', 'COMPLETED'
];
// Terminal states: REJECTED, DISMISSED
```

### 5.4 Status Colors (from MapDisplay.jsx)
```js
const statusColors = {
  'REPORTED': '#64748b', 'VERIFIED': '#3b82f6', 'ASSESSMENT': '#eab308',
  'COMMANDED': '#f97316', 'ACTION': '#22c55e', 'COMPLETED': '#0f172a'
};
```

### 5.5 Priority Score Thresholds (from incidentController.js)
| Level | Score Range |
|-------|-------------|
| CRITICAL | > 1000 |
| HIGH | > 500 |
| MEDIUM | > 200 |
| LOW | <= 200 |

### 5.6 AI Scoring Weights (from incidentController.js)
```js
// Dampak Manusia
deaths x100, missing x80, sick x40, displaced x30, affected x10
// Dampak Rumah
heavy_damage x50, medium_damage x30, light_damage x10
// Dampak Fasilitas Umum
health_facilities x60, worship_facilities x20, schools x25
// Dampak Vital
clean_water x70, electricity x50, telecom x30, irrigation x20, roads x60, fuel x25
// Dampak Lingkungan
farmland x5, livestock x2
```

### 5.7 Central Java Bounds (for scraper filtering)
```js
const CENTRAL_JAVA_BOUNDS = {
    minLat: -7.9, maxLat: -6.5,
    minLng: 108.7, maxLng: 111.5
};
```

---

## 6. Existing QR Code Format
Source: `backend/src/controllers/assetController.js`
```js
const qr_code = `PUSDATIN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
```

## 7. Existing Code Generator Format
Source: `backend/src/utils/generateCode.js`
```js
// Generates: NU-{KABUPATEN_PREFIX}-{YYMM}{RANDOM_4DIGIT}
// Example: NU-SEM-25051234
```

## 8. Env Vars Reference

### Backend (.env)
```env
PORT=7860
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=pusdatin_nu
JWT_SECRET=PUSDATIN_JATENG_SECRET_2024
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SOCKET_ALLOWED_ORIGINS=
GOOGLE_API_KEY=
SECRET_KEY_PWNU=PWNU_JATENG_BOSS
SECRET_KEY_PCNU=PCNU_JATENG_MEMBER
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:7860/api
VITE_SOCKET_URL=http://localhost:7860
VITE_OPENWEATHERMAP_KEY=
VITE_INARISK_WMS_URL=https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms
```

---

## 9. Building Assessment Details (4-Tier)
Detailed fields from `building_assessments` table and `BuildingAssessment.jsx`.

### 9.1 Technical Resilience
- `imb`, `slf`: Booleans (as VARCHAR) for legal status.
- `struktur`: `beton_bertulang`, `baja`, `kayu`, `tidak_tahu`.
- `non_struktural`: `tidak_ada`, `keramik`, `langit_langit`.

### 9.2 Social Vulnerability
- `odnk` (Orang Dengan Kebutuhan Khusus), `ibu_hamil`, `lansia`, `balita`.

### 9.3 Emergency Facilities
- `fasilitas`: JSONB array (e.g., `['ruang_pertemuan', 'pintu_darurat', 'jalur_evakuasi']`).
- `peralatan`: JSONB array (e.g., `['apar', 'tandu', 'speaker']`).
- `dana_darurat`, `anggaran`, `asuransi`: VARCHAR status.

---

## 10. API Endpoint Inventory

### 10.1 Public Endpoints
- `GET /api/ping`: Health check.
- `GET /api/incidents/public`: Filtered incident list for map.
- `GET /api/historical-data`: Access to 12,641 historical records.
- `POST /api/reports`: Public reporting (no auth).
- `POST /api/auth/login`: JWT issuance.
- `POST /api/auth/register`: Account creation with secret key validation.

### 10.2 Protected Endpoints (Auth Required)
- `GET /api/incidents`: List with role/region filtering.
- `POST /api/incidents`: Multi-part report with photo (using `multer`).
- `PATCH /api/incidents/:id/assessment`: Detailed damage/impact scoring.
- `GET /api/incidents/:id/full-report`: Aggregated data for SITREP.
- `POST /api/buildings`: Submit Building Assessment.
- `GET /api/volunteers`: Manage regional profiles.
- `POST /api/chat/broadcast`: Send regional alerts.
- `GET /api/analytics/summary`: KPI data for dashboards.

---

## 11. Socket.IO Matrix

| Event | Direction | Payload | Usage |
| :--- | :--- | :--- | :--- |
| `join_user` | Client -> Server | `userId` | Joins user-specific room for targeted notifications. |
| `emergency_broadcast` | Server -> Client | `{ incidentId }` | Triggers global data refresh on client. |
| `new_message` | Server -> Client | `Message object` | Real-time chat update in conversation room. |
| `notification` | Server -> Client | `Notification object` | In-app notification alert. |
| `emergency_alert` | Server -> Client | `{ title, body }` | High-priority push popup for PWNU/PCNU. |
| `notification_read` | Server -> Client | `{ notification_id }` | Syncs read status across devices. |

---

## 12. Frontend Navigation Logic

- **Public Route (`/`):** `PublicDashboard` (Main Map + News Ticker).
- **Public Report (`/lapor`):** `PublicReport` (Simplified reporting form).
- **Personnel Portal:** Unified Login/Register modal.
- **Role-Based Views (Post-Login):**
    - `RELAWAN`: `RelawanTactical.jsx` (Map + Active Missions + Status Update).
    - `FIELD_STAFF`: `FieldStaffDashboard.jsx` (Assessment & Survey focus).
    - `ADMIN (PCNU/PWNU)`: `AdminDashboard.jsx` (Command center, Approval, Analytics).
- **Offline Strategy:** `navigator.onLine` listener + `isOnline` state in `App.jsx`.

