/**
 * CSV Export Service
 * Export data to CSV format with UTF-8 BOM
 */

import Papa from 'papaparse';

// =============================================================================
// Types
// =============================================================================

export interface CSVRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface CSVData {
  headers: string[];
  rows: CSVRow[];
}

export interface CSVOptions {
  delimiter?: string;
  quoteChar?: string;
  escapeChar?: string;
  header?: boolean;
  newline?: '\r\n' | '\n' | '\r';
}

// =============================================================================
// Constants
// =============================================================================

// UTF-8 BOM for Excel compatibility
const UTF8_BOM = '\uFEFF';

const DEFAULT_OPTIONS: CSVOptions = {
  delimiter: ',',
  quoteChar: '"',
  escapeChar: '"',
  header: true,
  newline: '\r\n',
};

// =============================================================================
// Header Mapping
// =============================================================================

export const INCIDENT_HEADERS: Record<string, string> = {
  id: 'ID',
  type: 'Jenis',
  location: 'Lokasi',
  latitude: 'Latitude',
  longitude: 'Longitude',
  status: 'Status',
  severity: 'Tingkat',
  createdAt: 'Tanggal Laporan',
  updatedAt: 'Pembaruan Terakhir',
  reporter: 'Pelapor',
  description: 'Deskripsi',
  dead: 'Meninggal',
  injured: 'Luka',
  missing: 'Hilang',
};

export const VOLUNTEER_HEADERS: Record<string, string> = {
  id: 'ID',
  name: 'Nama',
  nik: 'NIK',
  phone: 'Telepon',
  email: 'Email',
  region: 'Wilayah',
  status: 'Status',
  skills: 'Keterampilan',
  certifications: 'Sertifikasi',
  joinedAt: 'Tanggal Bergabung',
  lastActive: 'Aktivitas Terakhir',
};

export const SHELTER_HEADERS: Record<string, string> = {
  id: 'ID',
  name: 'Nama',
  type: 'Jenis',
  address: 'Alamat',
  region: 'Wilayah',
  capacity: 'Kapasitas',
  currentOccupancy: 'Pengungsi Saat Ini',
  status: 'Status',
  facilities: 'Fasilitas',
  contact: 'Kontak',
};

export const RESOURCE_HEADERS: Record<string, string> = {
  id: 'ID',
  name: 'Nama',
  type: 'Jenis',
  category: 'Kategori',
  quantity: 'Jumlah',
  unit: 'Satuan',
  warehouse: 'Gudang',
  status: 'Status',
  expiryDate: 'Tanggal Kadaluarsa',
  lastUpdated: 'Pembaruan Terakhir',
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Map headers to localized labels
 */
export function mapHeaders<T extends CSVRow>(
  _data: T[],
  headerMap: Record<string, string>
): string[] {
  return Object.keys(headerMap);
}

/**
 * Map data rows to localized headers
 */
export function mapDataToHeaders<T extends CSVRow>(
  data: T[],
  headerMap: Record<string, string>
): CSVRow[] {
  return data.map((row) => {
    const mapped: CSVRow = {};
    Object.keys(headerMap).forEach((key) => {
      mapped[headerMap[key]] = row[key];
    });
    return mapped;
  });
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID');
}

/**
 * Format number for CSV
 */
export function formatNumberForCSV(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Format boolean for CSV
 */
export function formatBooleanForCSV(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value ? 'Ya' : 'Tidak';
}

/**
 * Format array for CSV
 */
export function formatArrayForCSV<T>(arr: T[] | null | undefined): string {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.join('; ');
}

// =============================================================================
// CSV Export Functions
// =============================================================================

/**
 * Convert data to CSV string
 */
export function toCSVString(data: CSVData, options?: CSVOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const result = Papa.unparse(data.rows, {
    delimiter: opts.delimiter,
    quoteChar: opts.quoteChar,
    escapeChar: opts.escapeChar,
    header: opts.header,
    newline: opts.newline,
    columns: data.headers,
  });

  return result;
}

/**
 * Export data to CSV with UTF-8 BOM
 */
export function toCSVWithBOM(data: CSVData, options?: CSVOptions): string {
  const csvString = toCSVString(data, options);
  return UTF8_BOM + csvString;
}

/**
 * Export incidents to CSV
 */
export function exportIncidentsToCSV(
  incidents: {
    id: string;
    type: string;
    location: string;
    latitude?: number;
    longitude?: number;
    status: string;
    severity?: string;
    createdAt: string;
    updatedAt: string;
    reporter?: string;
    description?: string;
    casualties?: { dead?: number; injured?: number; missing?: number };
  }[]
): string {
  const data: CSVData = {
    headers: Object.values(INCIDENT_HEADERS),
    rows: incidents.map((inc) => ({
      [INCIDENT_HEADERS.id]: inc.id,
      [INCIDENT_HEADERS.type]: inc.type,
      [INCIDENT_HEADERS.location]: inc.location,
      [INCIDENT_HEADERS.latitude]: formatNumberForCSV(inc.location?.lat),
      [INCIDENT_HEADERS.longitude]: formatNumberForCSV(inc.location?.lng),
      [INCIDENT_HEADERS.status]: inc.status,
      [INCIDENT_HEADERS.severity]: inc.severity || '',
      [INCIDENT_HEADERS.createdAt]: formatDateForCSV(inc.createdAt),
      [INCIDENT_HEADERS.updatedAt]: formatDateForCSV(inc.updatedAt),
      [INCIDENT_HEADERS.reporter]: inc.reporter || '',
      [INCIDENT_HEADERS.description]: inc.description || '',
      [INCIDENT_HEADERS.dead]: formatNumberForCSV(inc.casualties?.dead),
      [INCIDENT_HEADERS.injured]: formatNumberForCSV(inc.casualties?.injured),
      [INCIDENT_HEADERS.missing]: formatNumberForCSV(inc.casualties?.missing),
    })),
  };

  return toCSVWithBOM(data);
}

/**
 * Export volunteers to CSV
 */
export function exportVolunteersToCSV(
  volunteers: {
    id: string;
    name: string;
    nik?: string;
    phone?: string;
    email?: string;
    region?: string;
    status?: string;
    skills?: string[];
    certifications?: string[];
    joinedAt?: string;
    lastActive?: string;
  }[]
): string {
  const data: CSVData = {
    headers: Object.values(VOLUNTEER_HEADERS),
    rows: volunteers.map((vol) => ({
      [VOLUNTEER_HEADERS.id]: vol.id,
      [VOLUNTEER_HEADERS.name]: vol.name,
      [VOLUNTEER_HEADERS.nik]: vol.nik || '',
      [VOLUNTEER_HEADERS.phone]: vol.phone || '',
      [VOLUNTEER_HEADERS.email]: vol.email || '',
      [VOLUNTEER_HEADERS.region]: vol.region || '',
      [VOLUNTEER_HEADERS.status]: vol.status || '',
      [VOLUNTEER_HEADERS.skills]: formatArrayForCSV(vol.skills),
      [VOLUNTEER_HEADERS.certifications]: formatArrayForCSV(vol.certifications),
      [VOLUNTEER_HEADERS.joinedAt]: formatDateForCSV(vol.joinedAt),
      [VOLUNTEER_HEADERS.lastActive]: formatDateForCSV(vol.lastActive),
    })),
  };

  return toCSVWithBOM(data);
}

/**
 * Export shelters to CSV
 */
export function exportSheltersToCSV(
  shelters: {
    id: string;
    name: string;
    type?: string;
    address?: string;
    region?: string;
    capacity?: number;
    currentOccupancy?: number;
    status?: string;
    facilities?: string[];
    contact?: string;
  }[]
): string {
  const data: CSVData = {
    headers: Object.values(SHELTER_HEADERS),
    rows: shelters.map((shelter) => ({
      [SHELTER_HEADERS.id]: shelter.id,
      [SHELTER_HEADERS.name]: shelter.name,
      [SHELTER_HEADERS.type]: shelter.type || '',
      [SHELTER_HEADERS.address]: shelter.address || '',
      [SHELTER_HEADERS.region]: shelter.region || '',
      [SHELTER_HEADERS.capacity]: formatNumberForCSV(shelter.capacity),
      [SHELTER_HEADERS.currentOccupancy]: formatNumberForCSV(shelter.currentOccupancy),
      [SHELTER_HEADERS.status]: shelter.status || '',
      [SHELTER_HEADERS.facilities]: formatArrayForCSV(shelter.facilities),
      [SHELTER_HEADERS.contact]: shelter.contact || '',
    })),
  };

  return toCSVWithBOM(data);
}

/**
 * Export resources to CSV
 */
export function exportResourcesToCSV(
  resources: {
    id: string;
    name: string;
    type?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    warehouse?: string;
    status?: string;
    expiryDate?: string;
    lastUpdated?: string;
  }[]
): string {
  const data: CSVData = {
    headers: Object.values(RESOURCE_HEADERS),
    rows: resources.map((res) => ({
      [RESOURCE_HEADERS.id]: res.id,
      [RESOURCE_HEADERS.name]: res.name,
      [RESOURCE_HEADERS.type]: res.type || '',
      [RESOURCE_HEADERS.category]: res.category || '',
      [RESOURCE_HEADERS.quantity]: formatNumberForCSV(res.quantity),
      [RESOURCE_HEADERS.unit]: res.unit || '',
      [RESOURCE_HEADERS.warehouse]: res.warehouse || '',
      [RESOURCE_HEADERS.status]: res.status || '',
      [RESOURCE_HEADERS.expiryDate]: formatDateForCSV(res.expiryDate),
      [RESOURCE_HEADERS.lastUpdated]: formatDateForCSV(res.lastUpdated),
    })),
  };

  return toCSVWithBOM(data);
}

/**
 * Export generic data to CSV
 */
export function exportGenericToCSV<T extends Record<string, unknown>>(
  data: T[],
  headerMap: Record<string, string>
): string {
  const mappedData = mapDataToHeaders(data, headerMap);

  const csvData: CSVData = {
    headers: Object.values(headerMap),
    rows: mappedData,
  };

  return toCSVWithBOM(csvData);
}

// =============================================================================
// Download Functions
// =============================================================================

/**
 * Download CSV string as file
 */
export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV filename with date
 */
export function generateCSVFilename(base: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${base}_${date}.csv`;
}

/**
 * Export and download data
 */
export function exportAndDownload<T extends Record<string, unknown>>(
  data: T[],
  headerMap: Record<string, string>,
  baseFilename: string
): void {
  const csvString = exportGenericToCSV(data, headerMap);
  const filename = generateCSVFilename(baseFilename);
  downloadCSV(csvString, filename);
}