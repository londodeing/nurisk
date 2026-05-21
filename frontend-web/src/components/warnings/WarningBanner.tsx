'use client';

import { useState, useEffect } from 'react';
import {
  getWarningLevelColor,
  getWarningLevelLabel,
  formatIssuedTime,
  getTimeUntilExpiry,
  isWarningExpired,
  type Warning,
} from '@/services/earlyWarningService';

interface WarningBannerProps {
  warning: Warning;
  onDismiss?: () => void;
  onClick?: () => void;
  autoDismiss?: boolean;
  showCountdown?: boolean;
}

export function WarningBanner({
  warning,
  onDismiss,
  onClick,
  autoDismiss = true,
  showCountdown = true,
}: WarningBannerProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Check if warning is expired
  useEffect(() => {
    if (autoDismiss && isWarningExpired(warning)) {
      setIsExpired(true);
      onDismiss?.();
    }
  }, [warning, autoDismiss, onDismiss]);

  // Update countdown every minute
  useEffect(() => {
    if (!showCountdown) return;

    const updateCountdown = () => {
      setCountdown(getTimeUntilExpiry(warning.expiresAt) ?? '');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [warning, showCountdown]);

  if (isExpired || warning.status !== 'ACTIVE') {
    return null;
  }

  const levelColors = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-800',
    },
    advisory: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
    },
    watch: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      text: 'text-orange-800',
    },
    warning: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-800',
    },
  };

  const colors = levelColors[warning.severity.toLowerCase() as keyof typeof levelColors] || levelColors.info;

  return (
    <div
      className={`relative cursor-pointer rounded-lg border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 text-2xl ${colors.icon}`}>
          ⚠️
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getWarningLevelColor(warning.severity)}`}
            >
              {getWarningLevelLabel(warning.severity)}
            </span>
            <span className="text-xs text-gray-500">
              {warning.severity}
            </span>
          </div>

          {/* Title */}
          <h3 className={`mt-1 font-semibold ${colors.text}`}>{warning.title}</h3>

          {/* Description */}
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {warning.description}
          </p>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>📍 {warning.affectedAreas[0] || 'N/A'}</span>
            <span>🕐 {formatIssuedTime(warning.issuedAt)}</span>
            {showCountdown && countdown && <span>⏱️ {countdown}</span>}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * WarningBanner with auto-dismiss timer
 */
export function WarningBannerWithTimer(props: WarningBannerProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const expires = new Date(props.warning.expiresAt).getTime();
      return Math.max(0, expires - now);
    };

    setRemainingTime(calculateRemaining());

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        props.onDismiss?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [props.warning.expiresAt, props.onDismiss]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(Math.floor(minutes % 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <WarningBanner {...props} showCountdown={false} />
      {remainingTime > 0 && remainingTime < 3600000 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <span className="font-mono text-sm font-medium text-red-600">
            {formatTime(remainingTime)}
          </span>
        </div>
      )}
    </div>
  );
}

export default WarningBanner;