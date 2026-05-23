import { useState, useCallback } from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  Layers, Eye, EyeOff, Loader2, AlertTriangle,
  Waves, Mountain, CloudLightning,
  CloudDrizzle,
} from 'lucide-react';

export interface WmsLayerConfig {
  id: string;
  name: string;
  layerName: string;
  visible: boolean;
  opacity: number;
  format: string;
  transparent: boolean;
  icon: React.ElementType;
  color: string;
  styles?: string;
}

const WMS_BASE_URL = 'https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms';

// Layer names sourced from InaRISK BNPB GetCapabilities / KML NetworkLink
// Canonical workspace:raster with INDEKS_BAHAYA_{TYPE}1 naming
export const wmsLayersConfig: WmsLayerConfig[] = [
  {
    id: 'flood',
    name: 'Banjir',
    layerName: 'raster:INDEKS_BAHAYA_BANJIR1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: Waves,
    color: '#3b82f6',
    styles: 'index_bahaya',
  },
  {
    id: 'flash_flood',
    name: 'Banjir Bandang',
    layerName: 'raster:INDEKS_BAHAYA_BANJIRBANDANG1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: Waves,
    color: '#2563eb',
    styles: 'index_bahaya',
  },
  {
    id: 'landslide',
    name: 'Tanah Longsor',
    layerName: 'raster:INDEKS_BAHAYA_TANAHLONGSOR1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: Mountain,
    color: '#8b5cf6',
    styles: 'index_bahaya',
  },
  {
    id: 'extreme_weather',
    name: 'Cuaca Ekstrim',
    layerName: 'raster:INDEKS_BAHAYA_CUACAEKSTRIM1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: CloudLightning,
    color: '#f97316',
    styles: 'index_bahaya',
  },
  {
    id: 'drought',
    name: 'Kekeringan',
    layerName: 'raster:INDEKS_BAHAYA_KEKERINGAN1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: CloudDrizzle,
    color: '#f97316',
    styles: 'index_bahaya',
  },
  {
    id: 'volcano',
    name: 'Gunung Api',
    layerName: 'raster:INDEKS_BAHAYA_GUNUNGAPI1',
    visible: false,
    opacity: 0.7,
    format: 'image/png',
    transparent: true,
    icon: Mountain,
    color: '#dc2626',
    styles: 'index_bahaya',
  },
];

interface WmsLayerItemProps {
  layer: WmsLayerConfig;
  onToggle: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
  isLoading?: boolean;
  error?: string;
}

export function WmsLayerItem({ 
  layer, 
  onToggle, 
  onOpacityChange,
  isLoading,
  error 
}: WmsLayerItemProps) {
  const Icon = layer.icon;
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <Checkbox
        id={`wms-${layer.id}`}
        checked={layer.visible}
        onCheckedChange={() => onToggle(layer.id)}
      />
      <Label 
        htmlFor={`wms-${layer.id}`} 
        className="flex-1 flex items-center gap-2 cursor-pointer"
      >
        <Icon className="w-4 h-4" style={{ color: layer.color }} />
        <span className="text-sm">{layer.name}</span>
      </Label>
      
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      {error && <AlertTriangle className="w-4 h-4 text-amber-500" />}
      
      {layer.visible && (
        <div className="flex items-center gap-1 w-20">
          <Input
            type="range"
            min={0}
            max={100}
            value={layer.opacity * 100}
            onChange={(e) => onOpacityChange(layer.id, Number(e.target.value) / 100)}
            className="h-1"
          />
          <span className="text-xs text-slate-500 w-8">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface WmsOverlayProps {
  layers?: WmsLayerConfig[];
  onLayerToggle?: (id: string) => void;
  onOpacityChange?: (id: string, opacity: number) => void;
  className?: string;
}

export function WmsOverlay({ 
  layers = wmsLayersConfig,
  onLayerToggle,
  onOpacityChange,
  className,
}: WmsOverlayProps) {
  const [expanded, setExpanded] = useState(true);
  
  const handleToggle = useCallback((id: string) => {
    onLayerToggle?.(id);
  }, [onLayerToggle]);
  
  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    onOpacityChange?.(id, opacity);
  }, [onOpacityChange]);
  
  const visibleCount = layers.filter(l => l.visible).length;
  
  return (
    <Card className={cn('w-56', className)}>
      <CardHeader className="p-3 pb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            InaRISK BNPB
            {visibleCount > 0 && (
              <span className="text-xs bg-nu-green text-white px-1.5 py-0.5 rounded-full">
                {visibleCount}
              </span>
            )}
          </CardTitle>
          {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="p-2 pt-0 space-y-1 max-h-64 overflow-auto">
          {layers.map(layer => (
            <WmsLayerItem
              key={layer.id}
              layer={layer}
              onToggle={handleToggle}
              onOpacityChange={handleOpacityChange}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// WMS TileLayer component for rendering
interface WmsLayerProps {
  layer: WmsLayerConfig;
}

export function WmsLayer({ layer }: WmsLayerProps) {
  if (!layer.visible) return null;

  return (
    <WMSTileLayer
      url={WMS_BASE_URL}
      layers={layer.layerName}
      format={layer.format}
      transparent={layer.transparent}
      opacity={layer.opacity}
      version="1.1.1"
      styles={layer.styles}
    />
  );
}

export default WmsOverlay;