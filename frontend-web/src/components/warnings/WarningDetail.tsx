'use client';

import { useState, useEffect } from 'react';
import {
  getWarningLevelLabel,
  formatIssuedTime,
  getTimeUntilExpiry,
  getSeverityLabel,
  type Warning,
} from '@/services/earlyWarningService';

interface WarningDetailProps {
  warning: Warning;
  onClose?: () => void;
  onBroadcast?: () => void;
  onDismiss?: () => void;
  showMap?: boolean;
  showHistory?: boolean;
}

export function WarningDetail({
  warning,
  onClose,
  onBroadcast,
  onDismiss,
  showMap = true,
  showHistory = true,
}: WarningDetailProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilExpiry(warning.expiresAt) ?? '');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [warning]);

  const levelColors: Record<string, { bg: string; border: string; icon: string; text: string; badge: string }> = {
    informational: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-700',
    },
    advisory: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    watch: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      text: 'text-orange-800',
      badge: 'bg-orange-100 text-orange-700',
    },
    warning: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-700',
    },
  };

  const colorKey = warning.severity.toLowerCase();
  const colors = (levelColors[colorKey as keyof typeof levelColors] ?? levelColors.informational)!;
  const legacy = warning as any;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">⚠️</span>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}
            >
              {getWarningLevelLabel(warning.severity)}
            </span>
            <h2 className={`mt-1 text-xl font-bold ${colors.text}`}>
              {warning.title}
            </h2>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          📡 {warning.source}
        </span>
        <span className="flex items-center gap-1">
          🕐 Diterbitkan: {formatIssuedTime(warning.issuedAt)}
        </span>
        <span className="flex items-center gap-1">
          ⏱️ Kadaluarsa: {countdown}
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Tingkat Severity</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${colors.bg.replace('-50', '-500')}`}
                style={{ width: '60%' }}
              />
            </div>
          </div>
          <span className={`font-medium ${colors.text}`}>
            {getSeverityLabel(warning.severity)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Deskripsi</h3>
        <p className="text-gray-600">{warning.description}</p>
      </div>

      {legacy.type === 'gempa' && legacy.magnitude && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Detail Gempa
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Magnitude:</span>
              <span className="ml-2 font-medium">{legacy.magnitude}</span>
            </div>
            {legacy.depth && (
              <div>
                <span className="text-gray-500">Kedalaman:</span>
                <span className="ml-2 font-medium">{legacy.depth} km</span>
              </div>
            )}
            {legacy.epicenter && (
              <div className="col-span-2">
                <span className="text-gray-500">Episentrum:</span>
                <span className="ml-2 font-medium">
                  {legacy.epicenter.lat.toFixed(4)}°S,{' '}
                  {legacy.epicenter.lng.toFixed(4)}°E
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {(legacy.type === 'banjir' || legacy.type === 'tsunami') &&
        legacy.estimatedHeight && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Estimasi Ketinggian Air
            </h3>
            <p className="text-lg font-medium">{legacy.estimatedHeight} meter</p>
          </div>
        )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Wilayah Terdampak
        </h3>
        <div className="flex flex-wrap gap-2">
          {warning.affectedAreas.map((area, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              📍 {typeof area === 'string' ? area : (area as any).name}
            </span>
          ))}
        </div>
      </div>

      {showMap && warning.affectedAreas.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Peta Wilayah Terdampak
          </h3>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <div className="flex h-full items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl">🗺️</div>
                <p className="mt-2 text-sm">Peta akan ditampilkan di sini</p>
                {legacy.affectedAreas?.[0]?.center && (
                  <p className="text-xs text-gray-400">
                    Koordinat:{' '}
                    {legacy.affectedAreas[0].center.lat.toFixed(4)}°S,{' '}
                    {legacy.affectedAreas[0].center.lng.toFixed(4)}°E
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {legacy.recommendedActions && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Tindakan yang Direkomendasikan
          </h3>
          <ul className="space-y-2">
            {legacy.recommendedActions.map((action: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  {index + 1}
                </span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showHistory && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Kejadian Serupa Sebelumnya
          </h3>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="text-4xl">📊</div>
            <p className="mt-2 text-sm text-gray-500">
              Riwayat kejadian serupa akan ditampilkan di sini
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
        {onBroadcast && warning.status === 'ACTIVE' && (
          <button
            onClick={onBroadcast}
            className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            📢 Broadcast Peringatan
          </button>
        )}
        {onDismiss && warning.status === 'ACTIVE' && (
          <button
            onClick={onDismiss}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tutup Peringatan
          </button>
        )}
      </div>
    </div>
  );
}

export default WarningDetail;
