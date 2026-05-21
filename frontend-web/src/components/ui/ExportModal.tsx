/**
 * ExportModal Component
 * Modal for selecting export format and options
 */

import { useState } from 'react';
import { X, FileText, FileSpreadsheet, File, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/export';
import { getFormatLabel } from '@/lib/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, options?: ExportOptions) => Promise<void>;
  title?: string;
  description?: string;
  formats?: ExportFormat[];
  options?: ExportOption[];
}

interface ExportOption {
  id: string;
  label: string;
  value: string | number | boolean;
}

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  pdf: <FileText className="h-8 w-8 text-red-500" />,
  csv: <FileSpreadsheet className="h-8 w-8 text-green-600" />,
  excel: <File className="h-8 w-8 text-emerald-600" />,
};

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  pdf: 'Unduh sebagai dokumen PDF yang dapat dicetak',
  csv: 'Unduh sebagai file CSV untuk spreadsheet',
  excel: 'Unduh sebagai file Excel dengan multiple sheets',
};

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  title = 'Export Data',
  description = 'Pilih format file untuk export data',
  formats = ['pdf', 'csv', 'excel'],
  options = [],
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!selectedFormat) return;

    setLoading(true);
    setError(null);

    try {
      await onExport(selectedFormat, selectedOptions);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Format File
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatSelect(format)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                    selectedFormat === format
                      ? 'border-nu-green bg-nu-green/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  {FORMAT_ICONS[format]}
                  <span className="text-sm font-medium text-slate-700">
                    {getFormatLabel(format)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          {options.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Opsi Tambahan
              </label>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedOptions[option.id]}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          [option.id]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-nu-green rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedFormat || loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              selectedFormat && !loading
                ? 'bg-nu-green hover:bg-nu-green/90 text-white'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Export Dialog
 * Lightweight version without modal wrapper
 */
export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  title = 'Export Data',
  formats = ['pdf', 'csv', 'excel'],
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
  title?: string;
  formats?: ExportFormat[];
}) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!selectedFormat) return;

    setLoading(true);
    try {
      await onExport(selectedFormat);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>

        <div className="space-y-2 mb-6">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-colors',
                selectedFormat === format
                  ? 'border-nu-green bg-nu-green/5'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              {FORMAT_ICONS[format]}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-slate-700">
                  {getFormatLabel(format)}
                </div>
                <div className="text-xs text-slate-500">
                  {FORMAT_DESCRIPTIONS[format]}
                </div>
              </div>
              {selectedFormat === format && (
                <Check className="h-5 w-5 text-nu-green" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedFormat || loading}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              selectedFormat && !loading
                ? 'bg-nu-green hover:bg-nu-green/90 text-white'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            )}
          >
            {loading ? 'Mengunduh...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;