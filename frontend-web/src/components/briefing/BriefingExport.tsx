'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExecutiveBriefing } from '@/services/briefingService';

interface BriefingExportProps {
  briefing: ExecutiveBriefing;
  className?: string;
}

export function BriefingExport({ briefing, className }: BriefingExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Generate PDF content as HTML
      const html = generatePDFHTML(briefing);
      
      // Create a blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SITREP-${formatDate(briefing.generatedAt)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50',
        className
      )}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">Export SITREP</span>
    </button>
  );
}

// ============================================
// PDF HTML Generator
// ============================================

function generatePDFHTML(briefing: ExecutiveBriefing): string {
  const { situation, metrics, actions, generatedAt } = briefing;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SITREP - ${formatDate(generatedAt)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e293b; padding-bottom: 10px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 12px; color: #64748b; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 16px; margin-bottom: 10px; padding: 5px 10px; background: #f1f5f9; }
    .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
    .status.normal { background: #dcfce7; color: #166534; }
    .status.elevated { background: #fef3c7; color: #92400e; }
    .status.critical { background: #ffedd5; color: #9a3412; }
    .status.emergency { background: #fee2e2; color: #991b1b; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .card { border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; }
    .card .label { font-size: 10px; color: #64748b; }
    .card .value { font-size: 20px; font-weight: bold; }
    .card .sub { font-size: 10px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
    th { background: #f1f5f9; }
    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #64748b; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>LAPORAN SITUASI TANGGAP BENCANA</h1>
    <p>Generated: ${formatDate(generatedAt)} | ${formatTime(generatedAt)}</p>
  </div>

  <div class="section">
    <h2>RINGKASAN SITUASI</h2>
    <p><span class="status ${situation.overall}">${situation.overall.toUpperCase()}</span></p>
    <p style="margin-top: 10px;"><strong>${situation.headline}</strong></p>
    <ul style="margin-top: 10px; padding-left: 20px;">
      ${situation.details.map(d => `<li>${d}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>INDIKATOR KINERJA</h2>
    <div class="grid">
      <div class="card">
        <div class="label">Total Incident</div>
        <div class="value">${metrics.totalIncidents}</div>
        <div class="sub">${metrics.activeIncidents} aktif</div>
      </div>
      <div class="card">
        <div class="label">Waktu Respons</div>
        <div class="value">${metrics.avgResponseTime}m</div>
        <div class="sub">rata-rata</div>
      </div>
      <div class="card">
        <div class="label">Resolusi</div>
        <div class="value">${Math.round((metrics.resolvedIncidents / metrics.totalIncidents) * 100)}%</div>
        <div class="sub">${metrics.resolvedIncidents}/${metrics.totalIncidents}</div>
      </div>
      <div class="card">
        <div class="label">Volunteer</div>
        <div class="value">${metrics.volunteerCount}</div>
        <div class="sub">${metrics.resourceUtilization}% terpakai</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>REKOMENDASI</h2>
    <table>
      <thead>
        <tr>
          <th>Prioritas</th>
          <th>Tindakan</th>
          <th>Deskripsi</th>
          <th>Wilayah</th>
        </tr>
      </thead>
      <tbody>
        ${actions.map(a => `
          <tr>
            <td>${a.priority.toUpperCase()}</td>
            <td>${a.title}</td>
            <td>${a.description}</td>
            <td>${a.affectedRegions.join(', ') || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Sistem Nurisk - Aplikasi Tanggap Bencana</p>
    <p>Dibuat secara otomatis pada ${new Date().toLocaleString('id-ID')}</p>
  </div>
</body>
</html>
  `.trim();
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default BriefingExport;