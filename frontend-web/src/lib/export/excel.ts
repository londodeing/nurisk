/**
 * Excel Export Service
 * Export data to Excel (.xlsx) format using SheetJS
 */

import * as XLSX from 'xlsx';

// =============================================================================
// Types
// =============================================================================

export interface ExcelSheet {
  name: string;
  data: unknown[][];
}

export interface ExcelWorkbook {
  sheets: ExcelSheet[];
  filename?: string;
}

export interface ExcelCellStyle {
  font?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    size?: number;
  };
  fill?: {
    fgColor?: string;
    bgColor?: string;
  };
  border?: {
    style?: 'thin' | 'medium' | 'thick';
    color?: string;
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'center' | 'bottom';
  };
  numFmt?: string;
}

export interface ExcelOptions {
  bookType?: XLSX.BookType;
  compression?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const NU_GREEN = '00A032';
const HEADER_FONT = { bold: true, color: 'FFFFFF', size: 11 };
const HEADER_FILL = { fgColor: NU_GREEN };
const BORDER = { style: 'thin' as const, color: '000000' };

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create workbook
 */
export function createWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new();
}

/**
 * Create worksheet from data
 */
export function createWorksheet(data: unknown[][]): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(data);
}

/**
 * Set column widths
 */
export function setColumnWidths(
  sheet: XLSX.WorkSheet,
  widths: number[]
): void {
  const cols = widths.map((w, _i) => ({
    wch: w,
  }));
  sheet['!cols'] = cols;
}

/**
 * Set row heights
 */
export function setRowHeights(
  sheet: XLSX.WorkSheet,
  heights: number[]
): void {
  const rows = heights.map((h, _i) => ({
    h,
    hidden: false,
  }));
  sheet['!rows'] = rows;
}

/**
 * Merge cells
 */
export function mergeCells(
  sheet: XLSX.WorkSheet,
  range: { s: { r: number; c: number }; e: { r: number; c: number } }
): void {
  const merges = sheet['!merges'] || [];
  merges.push(range);
  sheet['!merges'] = merges;
}

/**
 * Add header row with styling
 */
export function addHeaderRow(
  sheet: XLSX.WorkSheet,
  headers: string[],
  rowIndex = 0
): void {
  headers.forEach((header, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    sheet[cellRef] = {
      t: 's',
      v: header,
      s: {
        font: HEADER_FONT,
        fill: HEADER_FILL,
        border: BORDER,
        alignment: { horizontal: 'center' as const },
      },
    };
  });
}

/**
 * Add data rows
 */
export function addDataRows(
  sheet: XLSX.WorkSheet,
  data: unknown[][],
  startRow = 1
): void {
  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: startRow + rowIndex, c: colIndex });
      sheet[cellRef] = {
        t: typeof cell === 'number' ? 'n' : 's',
        v: cell,
        s: {
          border: BORDER,
        },
      };
    });
  });
}

/**
 * Add summary row
 */
export function addSummaryRow(
  sheet: XLSX.WorkSheet,
  label: string,
  value: string | number,
  rowIndex: number,
  colIndex = 0
): void {
  const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
  sheet[cellRef] = {
    t: 's',
    v: label,
    s: {
      font: { bold: true },
      border: BORDER,
    },
  };

  const valueRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex + 1 });
  sheet[valueRef] = {
    t: typeof value === 'number' ? 'n' : 's',
    v: value,
    s: {
      font: { bold: true },
      border: BORDER,
    },
  };
}

// =============================================================================
// Excel Export Functions
// =============================================================================

/**
 * Export incidents to Excel
 */
export function exportIncidentsToExcel(
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
): XLSX.WorkBook {
  const wb = createWorkbook();

  const headers = [
    'ID',
    'Jenis',
    'Lokasi',
    'Latitude',
    'Longitude',
    'Status',
    'Tingkat',
    'Tanggal Laporan',
    'Pembaruan Terakhir',
    'Pelapor',
    'Deskripsi',
    'Meninggal',
    'Luka',
    'Hilang',
  ];

  const data = incidents.map((inc) => [
    inc.id,
    inc.type,
    inc.location,
    inc.location?.lat || '',
    inc.location?.lng || '',
    inc.status,
    inc.severity || '',
    inc.createdAt,
    inc.updatedAt,
    inc.reporter || '',
    inc.description || '',
    inc.casualties?.dead || '',
    inc.casualties?.injured || '',
    inc.casualties?.missing || '',
  ]);

  const ws = createWorksheet([headers, ...data]);
  setColumnWidths(ws, [15, 12, 25, 12, 12, 12, 10, 18, 18, 15, 30, 8, 8, 8]);

  XLSX.utils.book_append_sheet(wb, ws, 'Insiden');

  return wb;
}

/**
 * Export volunteers to Excel
 */
export function exportVolunteersToExcel(
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
): XLSX.WorkBook {
  const wb = createWorkbook();

  const headers = [
    'ID',
    'Nama',
    'NIK',
    'Telepon',
    'Email',
    'Wilayah',
    'Status',
    'Keterampilan',
    'Sertifikasi',
    'Tanggal Bergabung',
    'Aktivitas Terakhir',
  ];

  const data = volunteers.map((vol) => [
    vol.id,
    vol.name,
    vol.nik || '',
    vol.phone || '',
    vol.email || '',
    vol.region || '',
    vol.status || '',
    vol.skills?.join('; ') || '',
    vol.certifications?.join('; ') || '',
    vol.joinedAt || '',
    vol.lastActive || '',
  ]);

  const ws = createWorksheet([headers, ...data]);
  setColumnWidths(ws, [10, 20, 20, 15, 25, 15, 12, 25, 25, 15, 15]);

  XLSX.utils.book_append_sheet(wb, ws, 'Relawan');

  return wb;
}

/**
 * Export shelters to Excel
 */
export function exportSheltersToExcel(
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
): XLSX.WorkBook {
  const wb = createWorkbook();

  const headers = [
    'ID',
    'Nama',
    'Jenis',
    'Alamat',
    'Wilayah',
    'Kapasitas',
    'Pengungsi Saat Ini',
    'Status',
    'Fasilitas',
    'Kontak',
  ];

  const data = shelters.map((shelter) => [
    shelter.id,
    shelter.name,
    shelter.type || '',
    shelter.address || '',
    shelter.region || '',
    shelter.capacity || '',
    shelter.currentOccupancy || '',
    shelter.status || '',
    shelter.facilities?.join('; ') || '',
    shelter.contact || '',
  ]);

  const ws = createWorksheet([headers, ...data]);
  setColumnWidths(ws, [10, 20, 12, 30, 15, 10, 12, 12, 30, 15]);

  XLSX.utils.book_append_sheet(wb, ws, 'Pengungsian');

  return wb;
}

/**
 * Export resources to Excel
 */
export function exportResourcesToExcel(
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
): XLSX.WorkBook {
  const wb = createWorkbook();

  const headers = [
    'ID',
    'Nama',
    'Jenis',
    'Kategori',
    'Jumlah',
    'Satuan',
    'Gudang',
    'Status',
    'Tanggal Kadaluarsa',
    'Pembaruan Terakhir',
  ];

  const data = resources.map((res) => [
    res.id,
    res.name,
    res.type || '',
    res.category || '',
    res.quantity || '',
    res.unit || '',
    res.warehouse || '',
    res.status || '',
    res.expiryDate || '',
    res.lastUpdated || '',
  ]);

  const ws = createWorksheet([headers, ...data]);
  setColumnWidths(ws, [10, 20, 12, 15, 10, 8, 15, 12, 15, 15]);

  XLSX.utils.book_append_sheet(wb, ws, 'Sumber Daya');

  return wb;
}

/**
 * Export multiple sheets
 */
export function exportMultiSheet(
  sheets: ExcelSheet[]
): XLSX.WorkBook {
  const wb = createWorkbook();

  sheets.forEach((sheet) => {
    const ws = createWorksheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  return wb;
}

/**
 * Export with summary sheet
 */
export function exportWithSummary(
  mainData: unknown[][],
  summaryData: { label: string; value: string | number }[],
  mainSheetName = 'Data',
  summarySheetName = 'Ringkasan'
): XLSX.WorkBook {
  const wb = createWorkbook();

  // Main data sheet
  const mainWs = createWorksheet(mainData);
  XLSX.utils.book_append_sheet(wb, mainWs, mainSheetName);

  // Summary sheet
  const summaryWs = createWorksheet([]);
  summaryData.forEach((item, index) => {
    addSummaryRow(summaryWs, item.label, item.value, index);
  });
  XLSX.utils.book_append_sheet(wb, mainWs, summarySheetName);

  return wb;
}

// =============================================================================
// Download Functions
// =============================================================================

/**
 * Download workbook as file
 */
export function downloadWorkbook(
  wb: XLSX.WorkBook,
  filename: string,
  options?: ExcelOptions
): void {
  const opts = options || { bookType: 'xlsx', compression: true };
  const buffer = XLSX.write(wb, {
    bookType: opts.bookType,
    compression: opts.compression,
    type: 'array',
  });

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

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
 * Generate Excel filename with date
 */
export function generateExcelFilename(base: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${base}_${date}.xlsx`;
}

/**
 * Export and download
 */
export function exportAndDownload(
  wb: XLSX.WorkBook,
  baseFilename: string
): void {
  const filename = generateExcelFilename(baseFilename);
  downloadWorkbook(wb, filename);
}

// =============================================================================
// Write to buffer
// =============================================================================

/**
 * Write workbook to array buffer
 */
export function writeToBuffer(
  wb: XLSX.WorkBook,
  options?: ExcelOptions
): ArrayBuffer {
  const opts = options || { bookType: 'xlsx', compression: true };
  return XLSX.write(wb, {
    bookType: opts.bookType,
    compression: opts.compression,
    type: 'array',
  }) as unknown as ArrayBuffer;
}