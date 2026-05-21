/**
 * Export Service
 * Unified export interface for PDF, CSV, and Excel
 */

// =============================================================================
// Types
// =============================================================================

export type ExportFormat = 'pdf' | 'csv' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  title?: string;
}

export interface ExportData {
  incidents?: unknown[];
  volunteers?: unknown[];
  shelters?: unknown[];
  resources?: unknown[];
}

// =============================================================================
// PDF Exports
// =============================================================================

export {
  exportSITREP,
  exportIncidentReport,
  exportTableToPDF,
  exportHTMLToPDF,
  downloadBlob,
  generateFilename,
  type SITREPData,
  type IncidentReportData,
  type PDFTableData,
  type PDFOptions,
} from './pdf';

// =============================================================================
// CSV Exports
// =============================================================================

export {
  exportIncidentsToCSV,
  exportVolunteersToCSV,
  exportSheltersToCSV,
  exportResourcesToCSV,
  exportGenericToCSV,
  downloadCSV,
  generateCSVFilename,
  exportAndDownload as exportAndDownloadCSV,
  INCIDENT_HEADERS,
  VOLUNTEER_HEADERS,
  SHELTER_HEADERS,
  RESOURCE_HEADERS,
  type CSVRow,
  type CSVData,
  type CSVOptions,
} from './csv';

// =============================================================================
// Excel Exports
// =============================================================================

export {
  exportIncidentsToExcel,
  exportVolunteersToExcel,
  exportSheltersToExcel,
  exportResourcesToExcel,
  exportMultiSheet,
  exportWithSummary,
  downloadWorkbook,
  generateExcelFilename,
  exportAndDownload as exportAndDownloadExcel,
  writeToBuffer,
  type ExcelSheet,
  type ExcelWorkbook,
  type ExcelOptions,
} from './excel';

// =============================================================================
// Unified Export Functions
// =============================================================================

/**
 * Export data to specified format
 */
export async function exportData(
  data: ExportData,
  options: ExportOptions
): Promise<void> {
  const { format, filename } = options;

  switch (format) {
    case 'pdf':
      // PDF export requires specific data structure
      // Use individual PDF functions for more control
      break;

    case 'csv':
      if (data.incidents) {
        const { exportIncidentsToCSV, downloadCSV, generateCSVFilename } = await import('./csv');
        const csv = exportIncidentsToCSV(data.incidents as Parameters<typeof exportIncidentsToCSV>[0]);
        downloadCSV(csv, generateCSVFilename(filename || 'incidents'));
      } else if (data.volunteers) {
        const { exportVolunteersToCSV, downloadCSV, generateCSVFilename } = await import('./csv');
        const csv = exportVolunteersToCSV(data.volunteers as Parameters<typeof exportVolunteersToCSV>[0]);
        downloadCSV(csv, generateCSVFilename(filename || 'volunteers'));
      } else if (data.shelters) {
        const { exportSheltersToCSV, downloadCSV, generateCSVFilename } = await import('./csv');
        const csv = exportSheltersToCSV(data.shelters as Parameters<typeof exportSheltersToCSV>[0]);
        downloadCSV(csv, generateCSVFilename(filename || 'shelters'));
      } else if (data.resources) {
        const { exportResourcesToCSV, downloadCSV, generateCSVFilename } = await import('./csv');
        const csv = exportResourcesToCSV(data.resources as Parameters<typeof exportResourcesToCSV>[0]);
        downloadCSV(csv, generateCSVFilename(filename || 'resources'));
      }
      break;

    case 'excel':
      if (data.incidents) {
        const { exportIncidentsToExcel, exportAndDownloadExcel } = await import('./excel');
        const wb = exportIncidentsToExcel(data.incidents as Parameters<typeof exportIncidentsToExcel>[0]);
        exportAndDownloadExcel(wb, filename || 'incidents');
      } else if (data.volunteers) {
        const { exportVolunteersToExcel, exportAndDownloadExcel } = await import('./excel');
        const wb = exportVolunteersToExcel(data.volunteers as Parameters<typeof exportVolunteersToExcel>[0]);
        exportAndDownloadExcel(wb, filename || 'volunteers');
      } else if (data.shelters) {
        const { exportSheltersToExcel, exportAndDownloadExcel } = await import('./excel');
        const wb = exportSheltersToExcel(data.shelters as Parameters<typeof exportSheltersToExcel>[0]);
        exportAndDownloadExcel(wb, filename || 'shelters');
      } else if (data.resources) {
        const { exportResourcesToExcel, exportAndDownloadExcel } = await import('./excel');
        const wb = exportResourcesToExcel(data.resources as Parameters<typeof exportResourcesToExcel>[0]);
        exportAndDownloadExcel(wb, filename || 'resources');
      }
      break;
  }
}

/**
 * Get export format options
 */
export function getExportFormats(): { value: ExportFormat; label: string; ext: string }[] {
  return [
    { value: 'pdf', label: 'PDF', ext: '.pdf' },
    { value: 'csv', label: 'CSV', ext: '.csv' },
    { value: 'excel', label: 'Excel', ext: '.xlsx' },
  ];
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  const formats = getExportFormats();
  return formats.find((f) => f.value === format)?.ext || '';
}

/**
 * Get format label
 */
export function getFormatLabel(format: ExportFormat): string {
  const formats = getExportFormats();
  return formats.find((f) => f.value === format)?.label || format;
}