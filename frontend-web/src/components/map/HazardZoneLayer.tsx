'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { type HazardZone, type HazardType } from '@/hooks/use-hazard';
import {
  getHazardTypeColor,
  getSeverityColor,
  type SeverityLevel,
} from '@/services/hazardService';

interface HazardZoneLayerProps {
  zone: HazardZone;
  opacity?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Renders a hazard zone as an SVG layer
 */
export function HazardZoneLayer({
  zone,
  opacity = 0.6,
  isSelected = false,
  onClick,
}: HazardZoneLayerProps) {
  const color = getHazardTypeColor(zone.hazard_type);
  const severityColor = getSeverityColor(zone.severity_level);

  // Generate polygon points from polygon_geometry
  const polygonPoints = useMemo(() => {
    if (!zone.polygon_geometry || zone.polygon_geometry.length === 0) {
      // Default polygon if no geometry provided
      return generateDefaultPolygon(zone.id, zone.region);
    }

    return zone.polygon_geometry
      .map((point) => `${point[0]},${point[1]}`)
      .join(' ');
  }, [zone.polygon_geometry, zone.id, zone.region]);

  // Calculate center for label positioning
  const center = useMemo(() => {
    if (!zone.polygon_geometry || zone.polygon_geometry.length === 0) {
      return { x: 150 + (zone.id % 5) * 100, y: 150 + Math.floor(zone.id / 5) * 80 };
    }

    const lons = zone.polygon_geometry.map((p) => p[0]);
    const lats = zone.polygon_geometry.map((p) => p[1]);
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

    // Convert to SVG coordinates (simplified)
    return {
      x: (centerLon - 112) * 500 + 150,
      y: (centerLat + 7.5) * 500 + 150,
    };
  }, [zone.polygon_geometry, zone.id]);

  return (
    <g
      className={cn('cursor-pointer', isSelected && 'cursor-pointer')}
      onClick={onClick}
    >
      {/* Zone polygon */}
      <polygon
        points={polygonPoints}
        fill={color}
        fillOpacity={opacity}
        stroke={isSelected ? '#1f2937' : color}
        strokeWidth={isSelected ? 3 : 1}
        className="transition-all hover:stroke-4"
      />

      {/* Severity indicator */}
      <circle
        cx={center.x + 30}
        cy={center.y - 20}
        r={isSelected ? 10 : 8}
        fill={severityColor}
        stroke="white"
        strokeWidth={2}
      />

      {/* Zone label */}
      <text
        x={center.x}
        y={center.y}
        className="fill-white text-xs font-medium pointer-events-none"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {zone.region}
      </text>

      {/* Severity label */}
      <text
        x={center.x + 30}
        y={center.y - 18}
        className="fill-white text-xs font-bold pointer-events-none"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '8px' }}
      >
        {getSeverityAbbrev(zone.severity_level)}
      </text>
    </g>
  );
}

/**
 * Generate default polygon for a zone
 */
function generateDefaultPolygon(id: number, region: string): string {
  const baseX = 100 + (id % 4) * 150;
  const baseY = 100 + Math.floor(id / 4) * 100;

  return `${baseX},${baseY} ${baseX + 100},${baseY} ${baseX + 100},${baseY + 60} ${baseX},${baseY + 60}`;
}

/**
 * Get abbreviated severity label
 */
function getSeverityAbbrev(level: SeverityLevel): string {
  const abbrevs: Record<SeverityLevel, string> = {
    very_low: 'VL',
    low: 'L',
    moderate: 'M',
    high: 'H',
    very_high: 'VH',
  };
  return abbrevs[level] || 'M';
}

/**
 * Hazard Zone Layer Group - renders multiple zones of the same type
 */
export function HazardZoneLayerGroup({
  zones,
  hazardType,
  opacity = 0.6,
  selectedId,
  onZoneClick,
}: {
  zones: HazardZone[];
  hazardType: HazardType;
  opacity?: number;
  selectedId?: number;
  onZoneClick?: (zone: HazardZone) => void;
}) {
  return (
    <g className="hazard-zone-group">
      {zones.map((zone) => (
        <HazardZoneLayer
          key={zone.id}
          zone={zone}
          opacity={opacity}
          isSelected={selectedId === zone.id}
          onClick={() => onZoneClick?.(zone)}
        />
      ))}
    </g>
  );
}

/**
 * Multi-layer hazard map component
 */
export function HazardMultiLayer({
  zones,
  activeLayers,
  opacity = 0.6,
  selectedId,
  onZoneClick,
}: {
  zones: HazardZone[];
  activeLayers: Record<HazardType, boolean>;
  opacity?: number;
  selectedId?: number;
  onZoneClick?: (zone: HazardZone) => void;
}) {
  // Group zones by type
  const zonesByType = useMemo(() => {
    const grouped: Record<HazardType, HazardZone[]> = {
      flood: [],
      earthquake: [],
      landslide: [],
      volcanic: [],
      tsunami: [],
      drought: [],
    };

    zones.forEach((zone) => {
      if (activeLayers[zone.hazard_type]) {
        grouped[zone.hazard_type].push(zone);
      }
    });

    return grouped;
  }, [zones, activeLayers]);

  return (
    <g className="hazard-multi-layer">
      {(Object.keys(zonesByType) as HazardType[]).map((type) =>
        activeLayers[type] ? (
          <HazardZoneLayerGroup
            key={type}
            zones={zonesByType[type]}
            hazardType={type}
            opacity={opacity}
            selectedId={selectedId}
            onZoneClick={onZoneClick}
          />
        ) : null
      )}
    </g>
  );
}

export default HazardZoneLayer;