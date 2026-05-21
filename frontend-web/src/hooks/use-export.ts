/**
 * useExport Hook
 * Hook for export functionality with loading and error states
 */

import { useState, useCallback } from 'react';
import type { ExportFormat } from '@/lib/export';
import {
  exportSITREP,
  exportIncidentReport,
  exportTableToPDF,
  exportIncidentsToCSV,
  exportVolunteersToCSV,
  exportSheltersToCSV,
  exportResourcesToCSV,
  exportIncidentsToExcel,
  exportVolunteersToExcel,
  exportSheltersToExcel,
  exportResourcesToExcel,
  downloadBlob,
  downloadCSV,
  downloadWorkbook,
  generateFilename,
  generateCSVFilename,
  generateExcelFilename,
  type SITREPData,
  type IncidentReportData,
  type PDFTableData,
} from '@/lib/export';

interface UseExportState {
  loading: boolean;
  error: string | null;
  progress: number;
}

interface UseExportReturn extends UseExportState {
  exportPDF: (data: SITREPData | IncidentReportData | PDFTableData, type: 'sitrep' | 'incident' | 'table') => Promise<void>;
  exportCSV: (data: unknown[], type: 'incidents' | 'volunteers' | 'shelters' | 'resources') => Promise<void>;
  exportExcel: (data: unknown[], type: 'incidents' | 'volunteers' | 'shelters' | 'resources') => Promise<void>;
  exportByFormat: (data: unknown[], type: 'incidents' | 'volunteers' | 'shelters' | 'resources', format: ExportFormat) => Promise<void>;
  reset: () => void;
}

/**
 * useExport hook
 */
export function useExport(): UseExportReturn {
  const [state, setState] = useState<UseExportState>({
    loading: false,
    error: null,
    progress: 0,
  });

  const reset = useCallback(() => {
    setState({ loading: false, error: null, progress: 0 });
  }, []);

  const setLoading = useCallback((loading: boolean, progress = 0) => {
    setState((prev) => ({ ...prev, loading, progress, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, loading: false, error }));
  }, []);

  /**
   * Export to PDF
   */
  const exportPDF = useCallback(
    async (
      data: SITREPData | IncidentReportData | PDFTableData,
      type: 'sitrep' | 'incident' | 'table'
    ) => {
      setLoading(true, 10);

      try {
        let blob: Blob;
        let filename: string;

        if (type === 'sitrep') {
          setLoading(true, 30);
          blob = await exportSITREP(data as SITREPData);
          filename = generateFilename('sitrep', 'pdf');
        } else if (type === 'incident') {
          setLoading(true, 30);
          blob = await exportIncidentReport(data as IncidentReportData);
          filename = generateFilename('incident', 'pdf');
        } else {
          setLoading(true, 30);
          const tableData = data as PDFTableData;
          blob = await exportTableToPDF('Data', tableData, filename);
          filename = generateFilename('export', 'pdf');
        }

        setLoading(true, 80);
        downloadBlob(blob, filename);
        setLoading(false, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'PDF export failed');
      }
    },
    [setLoading, setError]
  );

  /**
   * Export to CSV
   */
  const exportCSV = useCallback(
    async (data: unknown[], type: 'incidents' | 'volunteers' | 'shelters' | 'resources') => {
      setLoading(true, 10);

      try {
        let csv: string;
        let filename: string;

        switch (type) {
          case 'incidents':
            setLoading(true, 30);
            csv = exportIncidentsToCSV(data as Parameters<typeof exportIncidentsToCSV>[0]);
            filename = generateCSVFilename('incidents');
            break;
          case 'volunteers':
            setLoading(true, 30);
            csv = exportVolunteersToCSV(data as Parameters<typeof exportVolunteersToCSV>[0]);
            filename = generateCSVFilename('volunteers');
            break;
          case 'shelters':
            setLoading(true, 30);
            csv = exportSheltersToCSV(data as Parameters<typeof exportSheltersToCSV>[0]);
            filename = generateCSVFilename('shelters');
            break;
          case 'resources':
            setLoading(true, 30);
            csv = exportResourcesToCSV(data as Parameters<typeof exportResourcesToCSV>[0]);
            filename = generateCSVFilename('resources');
            break;
          default:
            throw new Error('Invalid export type');
        }

        setLoading(true, 80);
        downloadCSV(csv, filename);
        setLoading(false, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CSV export failed');
      }
    },
    [setLoading, setError]
  );

  /**
   * Export to Excel
   */
  const exportExcel = useCallback(
    async (data: unknown[], type: 'incidents' | 'volunteers' | 'shelters' | 'resources') => {
      setLoading(true, 10);

      try {
        let wb: ReturnType<typeof exportIncidentsToExcel>;
        let filename: string;

        switch (type) {
          case 'incidents':
            setLoading(true, 30);
            wb = exportIncidentsToExcel(data as Parameters<typeof exportIncidentsToExcel>[0]);
            filename = generateExcelFilename('incidents');
            break;
          case 'volunteers':
            setLoading(true, 30);
            wb = exportVolunteersToExcel(data as Parameters<typeof exportVolunteersToExcel>[0]);
            filename = generateExcelFilename('volunteers');
            break;
          case 'shelters':
            setLoading(true, 30);
            wb = exportSheltersToExcel(data as Parameters<typeof exportSheltersToExcel>[0]);
            filename = generateExcelFilename('shelters');
            break;
          case 'resources':
            setLoading(true, 30);
            wb = exportResourcesToExcel(data as Parameters<typeof exportResourcesToExcel>[0]);
            filename = generateExcelFilename('resources');
            break;
          default:
            throw new Error('Invalid export type');
        }

        setLoading(true, 80);
        downloadWorkbook(wb, filename);
        setLoading(false, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Excel export failed');
      }
    },
    [setLoading, setError]
  );

  /**
   * Export by format
   */
  const exportByFormat = useCallback(
    async (
      data: unknown[],
      type: 'incidents' | 'volunteers' | 'shelters' | 'resources',
      format: ExportFormat
    ) => {
      switch (format) {
        case 'pdf':
          // For PDF, we need table data
          await exportPDF(
            { head: [], body: [] as unknown[][] },
            'table'
          );
          break;
        case 'csv':
          await exportCSV(data, type);
          break;
        case 'excel':
          await exportExcel(data, type);
          break;
      }
    },
    [exportPDF, exportCSV, exportExcel]
  );

  return {
    ...state,
    exportPDF,
    exportCSV,
    exportExcel,
    exportByFormat,
    reset,
  };
}

/**
 * useExportModal hook
 * Hook for managing export modal state
 */
export function useExportModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

export default useExport;