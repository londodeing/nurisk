'use client';

import { useRef } from 'react';
import type { Warning } from '@/services/earlyWarningService';

interface WarningMapProps {
  warnings: Warning[];
  selectedWarning?: Warning;
  onWarningSelect?: (warning: Warning) => void;
  showControls?: boolean;
}

export function WarningMap({
  warnings,
  onWarningSelect,
  showControls = true,
}: WarningMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const getLevelColor = (severity: string) => {
    const colors: Record<string, string> = {
      INFORMATIONAL: '#3B82F6',
      ADVISORY: '#EAB308',
      WATCH: '#F97316',
      WARNING: '#EF4444',
      EMERGENCY: '#DC2626',
    };
    return colors[severity] || '#6B7280';
  };

  const getLevelFillOpacity = (level: string) => {
    const opacities: Record<string, number> = {
      INFORMATIONAL: 0.1,
      ADVISORY: 0.2,
      WATCH: 0.3,
      WARNING: 0.4,
      EMERGENCY: 0.5,
    };
    return opacities[level] || 0.1;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
      <div ref={mapRef} className="h-full w-full">
        <div className="flex h-full w-full flex-col">
          {showControls && (
            <div className="flex items-center justify-between bg-white px-3 py-2 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                Peta Peringatan Dini
              </span>
              <div className="flex gap-2">
                <button className="rounded bg-gray-100 p-1.5 hover:bg-gray-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button className="rounded bg-gray-100 p-1.5 hover:bg-gray-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="relative flex-1">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <svg className="absolute inset-0 h-full w-full">
              {warnings.map((warning) => (
                <g key={warning.id}>
                  <rect
                    x={10}
                    y={10 + warnings.indexOf(warning) * 40}
                    width={20}
                    height={20}
                    fill={getLevelColor(warning.severity)}
                    fillOpacity={getLevelFillOpacity(warning.severity)}
                    stroke={getLevelColor(warning.severity)}
                    strokeWidth="2"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={() => onWarningSelect?.(warning)}
                  />
                  <text
                    x={40}
                    y={24 + warnings.indexOf(warning) * 40}
                    className="fill-gray-700 text-xs font-medium"
                  >
                    {warning.title}
                  </text>
                </g>
              ))}
            </svg>

            <div className="absolute bottom-3 left-3 rounded-lg bg-white p-2 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-500/40" />
                  <span>Peringatan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-orange-500/30" />
                  <span>Watch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-yellow-500/20" />
                  <span>Advisory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500/10" />
                  <span>Informasi</span>
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 rounded-lg bg-white px-3 py-2 shadow-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-700">
                  {warnings.filter((w) => w.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-gray-500">Peringatan Aktif</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WarningAreaMap({
  area: _area,
  warning: _warning,
}: {
  area: any;
  warning: Warning;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl">🗺️</div>
          <p className="mt-2 text-sm">Peta area akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  );
}

export default WarningMap;
