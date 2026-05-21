/**
 * ExportButton Component
 * Button with export functionality and loading state
 */

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/export';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  formats?: ExportFormat[];
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showIcon?: boolean;
}

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  csv: <FileSpreadsheet className="h-4 w-4" />,
  excel: <File className="h-4 w-4" />,
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  csv: 'CSV',
  excel: 'Excel',
};

export function ExportButton({
  onExport,
  formats = ['pdf', 'csv', 'excel'],
  disabled = false,
  className,
  variant = 'primary',
  size = 'md',
  label = 'Export',
  showIcon = true,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const handleClick = async (format: ExportFormat) => {
    if (loading || disabled) return;

    setLoading(true);
    setSelectedFormat(format);

    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
      setSelectedFormat(null);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary: 'bg-nu-green hover:bg-nu-green/90 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  };

  // Single format button
  if (formats.length === 1) {
    const format = formats[0];
    const isLoading = loading && selectedFormat === format;

    return (
      <button
        onClick={() => handleClick(format)}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showIcon ? (
          FORMAT_ICONS[format]
        ) : null}
        <span>{label}</span>
      </button>
    );
  }

  // Dropdown for multiple formats
  return (
    <div className="relative inline-flex">
      <button
        onClick={() => handleClick(formats[0])}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showIcon ? (
          <Download className="h-4 w-4" />
        ) : null}
        <span>{label}</span>
      </button>

      {/* Simple dropdown - click to cycle through formats */}
      {formats.length > 1 && (
        <div className="ml-1 flex">
          {formats.map((format, index) => (
            <button
              key={format}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(format);
              }}
              disabled={disabled || (loading && selectedFormat === format)}
              className={cn(
                'inline-flex items-center justify-center p-2 rounded-r-lg transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                index === 0 && 'rounded-l-lg rounded-r-none',
                index > 0 && index < formats.length - 1 && 'rounded-none border-l border-slate-300',
                index === formats.length - 1 && 'rounded-l-none border-l border-slate-300',
                variant === 'primary'
                  ? 'bg-nu-green hover:bg-nu-green/90 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              )}
              title={`Export as ${FORMAT_LABELS[format]}`}
            >
              {loading && selectedFormat === format ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                FORMAT_ICONS[format]
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ExportButton with format selection
 */
export function ExportButtonWithMenu({
  onExport,
  formats = ['pdf', 'csv', 'excel'],
  disabled = false,
  className,
  variant = 'primary',
  size = 'md',
  label = 'Export',
  showIcon = true,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (loading || disabled) return;

    setLoading(true);
    setShowMenu(false);

    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary: 'bg-nu-green hover:bg-nu-green/90 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showIcon ? (
          <Download className="h-4 w-4" />
        ) : null}
        <span>{label}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={disabled || loading}
              className={cn(
                'flex items-center gap-2 w-full px-4 py-2 text-sm text-left rounded-t-lg transition-colors',
                'hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed',
                format === formats[0] && 'rounded-t-lg',
                format === formats[formats.length - 1] && 'rounded-b-lg'
              )}
            >
              {FORMAT_ICONS[format]}
              <span>{FORMAT_LABELS[format]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportButton;