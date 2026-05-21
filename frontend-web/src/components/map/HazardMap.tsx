'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  useHazardZones,
  useHazardZonesByType,
  type HazardZone,
  type HazardType,
} from '@/hooks/use-hazard';
import {
  getHazardTypeLabel,
  getHazardTypeColor,
  getSeverityColor,
  getSeverityLabel,
  MOCK_HAZARD_ZONES,
} from '@/services/hazardService';
import { HazardZoneLayer } from './HazardZoneLayer';

interface HazardMapProps {
  className?: string;
  showLegend?: boolean;
  showOpacitySlider?: boolean;
  showLayerToggle?: boolean;
  onZoneClick?: (zone: HazardZone) => void;
  selectedZone?: number;
}

export function HazardMap({
  className,
  showLegend = true,
  showOpacitySlider = true,
  showLayerToggle = true,
  onZoneClick,
  selectedZone,
}: HazardMapProps) {
  const [opacity, setOpacity] = useState(0.6);
  const [activeLayers, setActiveLayers] = useState<Record<HazardType, boolean>>({
    flood: true,
    earthquake: true,
    landslide: true,
    volcanic: true,
    tsunami: true,
    drought: true,
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { data: zones } = useHazardZones();
  const hazardZones = zones ?? MOCK_HAZARD_ZONES;

  // Filter zones by region
  const filteredZones = useMemo(() => {
    if (selectedRegion === 'all') return hazardZones;
    return hazardZones.filter((z) => z.region === selectedRegion);
  }, [hazardZones, selectedRegion]);

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = new Set(zones?.map((z) => z.region) ?? []);
    return Array.from(uniqueRegions);
  }, [zones]);

  // Toggle layer visibility
  const toggleLayer = (type: HazardType) => {
    setActiveLayers((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Get zones for each hazard type
  const zonesByType = useMemo(() => {
  const grouped: Record<HazardType, HazardZone[]> = {
    flood: [],
    earthquake: [],
    landslide: [],
    volcanic: [],
    tsunami: [],
    drought: [],
  };

  filteredZones.forEach((zone) => {
    if (activeLayers[zone.hazard_type]) {
      grouped[zone.hazard_type].push(zone);
    }
  });

  return grouped;
}, [filteredZones, activeLayers]);

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm p-3 border-b">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-800">Peta Zona Bahaya</h3>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-sm border rounded-md px-2 py-1"
          >
            <option value="all">Semua Wilayah</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layer Toggle */}
      {showLayerToggle && (
        <div className="absolute top-14 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs font-medium text-gray-600 mb-2">Layer</div>
          <div className="space-y-2">
            {(Object.keys(activeLayers) as HazardType[]).map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={activeLayers[type]}
                  onChange={() => toggleLayer(type)}
                  className="rounded"
                />
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getHazardTypeColor(type) }}
                />
                <span className="text-xs">{getHazardTypeLabel(type)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="pt-12 pb-8">
        <div className="relative h-full min-h-[400px] bg-gray-50">
          {/* Grid background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          {/* Hazard zone layers */}
          <svg className="absolute inset-0 h-full w-full">
            {(Object.keys(zonesByType) as HazardType[]).map((type) =>
              zonesByType[type].map((zone) => (
                <HazardZoneLayer
                  key={`${type}-${zone.id}`}
                  zone={zone}
                  opacity={opacity}
                  isSelected={selectedZone === zone.id}
                  onClick={() => onZoneClick?.(zone)}
                />
              ))
            )}
          </svg>

          {/* Stats overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm">
              <div className="font-medium text-gray-700">Total Zona</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredZones.length}
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm">
              <div className="font-medium text-gray-700">Populasi Terdampak</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredZones
                  .reduce((sum, z) => sum + z.population_exposed, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opacity Slider */}
      {showOpacitySlider && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 border-t">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-12">Opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && <HazardLegend className="absolute top-14 right-3" />}
    </div>
  );
}

/**
 * Hazard Legend Component
 */
export function HazardLegend({ className }: { className?: string }) {
  const hazardTypes: HazardType[] = [
    'flood',
    'earthquake',
    'landslide',
    'volcanic',
    'tsunami',
    'drought',
  ];

  const severityLevels = [
    'very_low',
    'low',
    'moderate',
    'high',
    'very_high',
  ] as const;

  return (
    <div className={cn('bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg', className)}>
      <div className="text-xs font-medium text-gray-600 mb-2">Jenis Bencana</div>
      <div className="space-y-1 mb-3">
        {hazardTypes.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: getHazardTypeColor(type) }}
            />
            <span className="text-xs">{getHazardTypeLabel(type)}</span>
          </div>
        ))}
      </div>

      <div className="text-xs font-medium text-gray-600 mb-2">Tingkat Severity</div>
      <div className="space-y-1">
        {severityLevels.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: getSeverityColor(level) }}
            />
            <span className="text-xs">{getSeverityLabel(level)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hazard Zone Popup
 */
export function HazardPopup({
  zone,
  onClose,
}: {
  zone: HazardZone;
  onClose?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{zone.region}</h4>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded"
            style={{ backgroundColor: getHazardTypeColor(zone.hazard_type) }}
          />
          <span className="font-medium">{getHazardTypeLabel(zone.hazard_type)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Severity</span>
          <div className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getSeverityColor(zone.severity_level) }}
            />
            <span className="font-medium">
              {getSeverityLabel(zone.severity_level)}
            </span>
          </div>
        </div>

        {zone.recurrence_interval && (
          <div className="flex justify-between">
            <span className="text-gray-500">Recurrence</span>
            <span className="font-medium">{zone.recurrence_interval}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-500">Populasi</span>
          <span className="font-medium">
            {zone.population_exposed.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Infrastruktur</span>
          <span className="font-medium">
            Rp {(zone.infrastructure_value / 1000000).toFixed(0)}M
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple hazard indicator
 */
export function HazardIndicator({
  type,
  severity,
  showLabel = true,
  size = 'md',
}: {
  type: HazardType;
  severity: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('rounded', sizes[size])}
        style={{ backgroundColor: getHazardTypeColor(type) }}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {getHazardTypeLabel(type)}
        </span>
      )}
    </div>
  );
}

/**
 * Hazard Type Badge
 */
export function HazardTypeBadge({
  type,
  className,
}: {
  type: HazardType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        className,
      )}
      style={{
        backgroundColor: `${getHazardTypeColor(type)}20`,
        color: getHazardTypeColor(type),
      }}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: getHazardTypeColor(type) }}
      />
      {getHazardTypeLabel(type)}
    </span>
  );
}

/**
 * Severity Badge
 */
export function SeverityBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const severityLevel = level as 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        className,
      )}
      style={{
        backgroundColor: `${getSeverityColor(severityLevel)}20`,
        color: getSeverityColor(severityLevel),
      }}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: getSeverityColor(severityLevel) }}
      />
      {getSeverityLabel(severityLevel)}
    </span>
  );
}

export default HazardMap;