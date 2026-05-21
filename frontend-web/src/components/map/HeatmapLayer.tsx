import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export interface HeatmapConfig {
  radius?: number;
  blur?: number;
  maxZoom?: number;
  maxIntensity?: number;
  gradient?: Record<number, string>;
}

const DEFAULT_CONFIG: HeatmapConfig = {
  radius: 25,
  blur: 15,
  maxZoom: 18,
  maxIntensity: 1.0,
  gradient: {
    0.2: '#22c55e',  // green
    0.4: '#84cc16',  // lime
    0.6: '#c5a059',  // gold
    0.8: '#f97316',  // orange
    1.0: '#dc2626', // red
  },
};

interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatmapLayerProps {
  data: HeatmapDataPoint[];
  enabled?: boolean;
  config?: HeatmapConfig;
}

export function HeatmapLayer({ 
  data = [], 
  enabled = false, 
  config = DEFAULT_CONFIG 
}: HeatmapLayerProps) {
  const map = useMap();
  const heatmapLayerRef = useRef<L.HeatLayer | null>(null);
  
  const mergedConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);
  
  // Create heatmap layer
  useEffect(() => {
    if (!map) return;
    
    // Remove existing heatmap layer
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }
    
    if (!enabled || data.length === 0) return;
    
    // Prepare heat data: [lat, lng, intensity]
    const heatData: [number, number, number][] = data.map(point => [
      point.lat,
      point.lng,
      point.intensity || 1,
    ]);
    
    // Create heatmap layer
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: mergedConfig.radius,
      blur: mergedConfig.blur,
      maxZoom: mergedConfig.maxZoom,
      maxIntensity: mergedConfig.maxIntensity,
      gradient: mergedConfig.gradient,
    });
    
    heatLayer.addTo(map);
    heatmapLayerRef.current = heatLayer;
    
    return () => {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    };
  }, [map, data, enabled, mergedConfig]);
  
  return null;
}

// Heatmap control component for UI
interface HeatmapControlProps {
  enabled: boolean;
  onToggle: () => void;
  radius: number;
  onRadiusChange: (value: number) => void;
}

export function HeatmapControl({ 
  enabled, 
  onToggle, 
  radius, 
  onRadiusChange 
}: HeatmapControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="heatmap-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="heatmap-toggle" className="flex items-center gap-2 cursor-pointer">
        <span className="text-sm">Heatmap</span>
      </label>
      {enabled && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-slate-500">Radius:</span>
          <input
            type="range"
            min={10}
            max={50}
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-16 h-1"
          />
          <span className="text-xs text-slate-500 w-6">{radius}</span>
        </div>
      )}
    </div>
  );
}

// Legend for heatmap
export function HeatmapLegend() {
  const gradient = DEFAULT_CONFIG.gradient;
  const steps = Object.entries(gradient)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([intensity, color]) => ({
      intensity: Number(intensity),
      color,
    }));
  
  return (
    <div className="bg-white/90 rounded-lg p-2 shadow-md">
      <p className="text-xs font-semibold mb-1">Kepadatan</p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div 
              className="w-4 h-4 first:rounded-l last:rounded-r"
              style={{ 
                backgroundColor: step.color,
                borderRadius: i === 0 ? '4px 0 0 4px' : i === steps.length - 1 ? '0 4px 4px 0' : '0',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Rendah</span>
        <span>Tinggi</span>
      </div>
    </div>
  );
}

export default HeatmapLayer;