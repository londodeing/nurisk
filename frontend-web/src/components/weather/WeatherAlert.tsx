import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherAlert as WeatherAlertType } from '@/services/weatherService';

interface WeatherAlertProps {
  alert: WeatherAlertType;
  onDismiss?: (id: string) => void;
  className?: string;
}

const SEVERITY_STYLES = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    description: 'text-blue-700',
  },
  watch: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    description: 'text-amber-700',
  },
  warning: {
    container: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-500',
    title: 'text-orange-800',
    description: 'text-orange-700',
  },
  emergency: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    description: 'text-red-700',
  },
};

const SEVERITY_LABELS = {
  info: 'Informasi',
  watch: 'Pengawasan',
  warning: 'Peringatan',
  emergency: 'Darurat',
};

export function WeatherAlert({ alert, onDismiss, className }: WeatherAlertProps) {
  const styles = SEVERITY_STYLES[alert.severity];
  const severityLabel = SEVERITY_LABELS[alert.severity];

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(alert.id);
    }
  };

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border',
        styles.container,
        className
      )}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Tutup peringatan"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-2">
        <AlertTriangle className={cn('w-4 h-4 mt-0.5', styles.icon)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn('text-sm font-semibold', styles.title)}>
              {alert.title}
            </p>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                styles.icon,
                'bg-white/50'
              )}
            >
              {severityLabel}
            </span>
          </div>

          {/* Description */}
          <p className={cn('text-xs mt-1', styles.description)}>
            {alert.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>{alert.area}</span>
            <span>•</span>
            <span>Sumber: {alert.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline display
interface WeatherAlertCompactProps {
  alerts: WeatherAlertType[];
  className?: string;
}

export function WeatherAlertList({ alerts, className }: WeatherAlertCompactProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map((alert) => (
        <WeatherAlert key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

// Alert banner for prominent display
interface WeatherAlertBannerProps {
  alerts: WeatherAlertType[];
  className?: string;
}

export function WeatherAlertBanner({
  alerts,
  className,
}: WeatherAlertBannerProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Get the highest severity alert
  const criticalAlert = alerts.find((a) => a.severity === 'emergency');
  const warningAlert = alerts.find((a) => a.severity === 'warning');
  const activeAlert = criticalAlert || warningAlert || alerts[0];

  if (!activeAlert) {
    return null;
  }

  const styles = SEVERITY_STYLES[activeAlert.severity];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        styles.container,
        className
      )}
    >
      <AlertTriangle className={cn('w-5 h-5 flex-shrink-0', styles.icon)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold truncate', styles.title)}>
          {activeAlert.title}
        </p>
        <p className={cn('text-xs truncate', styles.description)}>
          {activeAlert.description}
        </p>
      </div>
      {alerts.length > 1 && (
        <span className="text-xs text-slate-500">+{alerts.length - 1} lagi</span>
      )}
    </div>
  );
}