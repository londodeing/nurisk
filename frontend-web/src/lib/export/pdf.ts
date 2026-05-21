/**
 * PDF Export Service
 * Generate PDF reports using jsPDF
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// =============================================================================
// Types
// =============================================================================

export interface PDFTableData {
  head: string[][];
  body: (string | number)[][];
}

export interface PDFOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

export interface SITREPData {
  title: string;
  incidentDate: string;
  location: string;
  description: string;
  casualties?: {
    dead: number;
    injured: number;
    missing: number;
    evacuated: number;
  };
  response: {
    teamsDeployed: number;
    volunteers: number;
    shelters: number;
    supplies: string[];
  };
  mapImage?: string;
  images?: string[];
}

export interface IncidentReportData {
  id: string;
  type: string;
  location: string;
  coordinates: [number, number];
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: string;
  description: string;
  casualties?: {
    dead: number;
    injured: number;
    missing: number;
  };
  response?: {
    teamId: string;
    status: string;
    notes: string;
  };
}

// =============================================================================
// Constants
// =============================================================================

const NU_KOP = {
  name: 'NU PEDULI JAWA TENGAH',
  address: 'Jl. Ahmad Yani No. 10, Semarang',
  phone: '(024) 8310824',
  email: 'nusantara@nu.or.id',
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create PDF document
 */
export function createPDF(options: PDFOptions = {}): jsPDF {
  const { orientation = 'portrait', format = 'a4' } = options;

  return new jsPDF({
    orientation,
    format,
    unit: 'mm',
  });
}

/**
 * Add NU header
 */
export function addNUHeader(doc: jsPDF, title: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Logo placeholder (rectangle)
  doc.setFillColor(0, 100, 50);
  doc.rect(margin, 10, 15, 15, 'F');

  // Organization name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 50);
  doc.text(NU_KOP.name, margin + 20, 18);

  // Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(NU_KOP.address, margin + 20, 23);
  doc.text(`${NU_KOP.phone} • ${NU_KOP.email}`, margin + 20, 27);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, margin, 38);

  // Line separator
  doc.setDrawColor(0, 100, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, 41, pageWidth - margin, 41);
}

/**
 * Add page number
 */
export function addPageNumber(doc: jsPDF, page: number, total: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Halaman ${page} dari ${total}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

/**
 * Add footer
 */
export function addFooter(doc: jsPDF, text?: string): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    text || `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
    20,
    doc.internal.pageSize.getHeight() - 10
  );
}

/**
 * Add table to PDF
 */
export function addTable(
  doc: jsPDF,
  data: PDFTableData,
  startY: number
): number {
  autoTable(doc, {
    head: data.head,
    body: data.body,
    startY,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [0, 100, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    theme: 'striped',
  });

  // @ts-expect-error - autoTable adds this property
  return doc.lastAutoTable.finalY + 10;
}

// =============================================================================
// PDF Export Functions
// =============================================================================

/**
 * Export SITREP to PDF
 */
export async function exportSITREP(data: SITREPData): Promise<Blob> {
  const doc = createPDF({ orientation: 'portrait', format: 'a4' });
  const margin = 20;
  let yPos = 50;

  // Header
  addNUHeader(doc, 'LAPORAN SITUASI (SITREP)');
  yPos = 50;

  // Incident info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Informasi Insiden', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Judul: ${data.title}`, margin, yPos);
  yPos += 6;
  doc.text(`Tanggal: ${data.incidentDate}`, margin, yPos);
  yPos += 6;
  doc.text(`Lokasi: ${data.location}`, margin, yPos);
  yPos += 6;
  doc.text(`Deskripsi: ${data.description}`, margin, yPos);
  yPos += 10;

  // Casualties
  if (data.casualties) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Korban Jiwa', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Meninggal: ${data.casualties.dead}`, margin, yPos);
    doc.text(`Luka: ${data.casualties.injured}`, margin + 40, yPos);
    doc.text(`Hilang: ${data.casualties.missing}`, margin + 80, yPos);
    doc.text(`Evakuasi: ${data.casualties.evacuated}`, margin + 120, yPos);
    yPos += 10;
  }

  // Response
  if (data.response) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Respons', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Tim Diturunkan: ${data.response.teamsDeployed}`, margin, yPos);
    yPos += 6;
    doc.text(`Relawan: ${data.response.volunteers}`, margin, yPos);
    yPos += 6;
    doc.text(`Pengungsian: ${data.response.shelters}`, margin, yPos);
    yPos += 8;

    if (data.response.supplies.length > 0) {
      doc.text('Bantuan:', margin, yPos);
      yPos += 6;
      data.response.supplies.forEach((supply) => {
        doc.text(`• ${supply}`, margin + 5, yPos);
        yPos += 5;
      });
    }
  }

  // Map image
  if (data.mapImage) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Peta Lokasi', margin, yPos);
    yPos += 5;

    try {
      doc.addImage(data.mapImage, 'PNG', margin, yPos, 170, 80);
      yPos += 85;
    } catch {
      // Skip if image fails
    }
  }

  // Footer
  addFooter(doc);

  return doc.output('blob');
}

/**
 * Export incident report to PDF
 */
export async function exportIncidentReport(data: IncidentReportData): Promise<Blob> {
  const doc = createPDF({ orientation: 'portrait', format: 'a4' });
  const margin = 20;
  let yPos = 50;

  // Header
  addNUHeader(doc, 'LAPORAN INSIDEN');
  yPos = 50;

  // Incident details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Detail Insiden', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const details = [
    ['ID', data.id],
    ['Jenis', data.type],
    ['Lokasi', data.location],
    ['Koordinat', `${data.coordinates[0]}, ${data.coordinates[1]}`],
    ['Status', data.status],
    ['Tanggal Laporan', data.createdAt],
    ['Pembaruan Terakhir', data.updatedAt],
    ['Pelapor', data.reporter],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 40, yPos);
    yPos += 6;
  });

  yPos += 5;
  doc.text('Deskripsi:', margin, yPos);
  yPos += 6;
  doc.text(data.description, margin, yPos, { maxWidth: 170 });
  yPos += 20;

  // Casualties
  if (data.casualties) {
    doc.setFont('helvetica', 'bold');
    doc.text('Korban Jiwa:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Meninggal: ${data.casualties.dead}`, margin, yPos);
    doc.text(`Luka: ${data.casualties.injured}`, margin + 40, yPos);
    doc.text(`Hilang: ${data.casualties.missing}`, margin + 80, yPos);
    yPos += 15;
  }

  // Response
  if (data.response) {
    doc.setFont('helvetica', 'bold');
    doc.text('Respons:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Tim: ${data.response.teamId}`, margin, yPos);
    yPos += 6;
    doc.text(`Status: ${data.response.status}`, margin, yPos);
    yPos += 6;
    doc.text('Catatan:', margin, yPos);
    yPos += 6;
    doc.text(data.response.notes, margin, yPos, { maxWidth: 170 });
  }

  // Footer
  addFooter(doc);

  return doc.output('blob');
}

/**
 * Export table data to PDF
 */
export async function exportTableToPDF(
  title: string,
  data: PDFTableData,
  filename?: string
): Promise<Blob> {
  const doc = createPDF({ orientation: 'landscape', format: 'a4' });

  // Header
  addNUHeader(doc, title.toUpperCase());
  const yPos = 50;

  // Table
  addTable(doc, data, yPos);

  // Footer
  addFooter(doc, `File: ${filename || 'export.pdf'}`);

  return doc.output('blob');
}

/**
 * Export HTML to PDF
 */
export async function exportHTMLToPDF(
  elementId: string,
  _filename: string
): Promise<Blob> {
  // Dynamic import for html2canvas
  const html2canvas = (await import('html2canvas')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const doc = createPDF({ orientation: 'landscape', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 40;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 20;

  doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 20;
    doc.addPage();
    doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  addFooter(doc);

  return doc.output('blob');
}

// =============================================================================
// Download Functions
// =============================================================================

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
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
 * Generate filename with date
 */
export function generateFilename(base: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${base}_${date}.${extension}`;
}