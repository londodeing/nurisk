import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Home, Cloud, MapPin, Flame } from 'lucide-react';

interface LayerToggle {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface LayerControlsProps {
  onToggle: (layerId: string, enabled: boolean) => void;
}

export function LayerControls({ onToggle }: LayerControlsProps) {
  const [layers, setLayers] = useState<LayerToggle[]>([
    { id: 'incidents', label: 'Kejadian', icon: <MapPin className="w-4 h-4" />, enabled: true },
    { id: 'shelters', label: 'Posko', icon: <Home className="w-4 h-4" />, enabled: true },
    { id: 'weather', label: 'Cuaca', icon: <Cloud className="w-4 h-4" />, enabled: false },
    { id: 'heatmap', label: 'Heatmap', icon: <Flame className="w-4 h-4" />, enabled: false },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, enabled: !l.enabled } : l
    ));
    const layer = layers.find(l => l.id === id);
    if (layer) {
      onToggle(id, !layer.enabled);
    }
  };

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-40">
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
          <Layers className="w-4 h-4" />
          Layers
        </div>
        <div className="space-y-1">
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                layer.enabled 
                  ? 'bg-nu-green text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {layer.icon}
              {layer.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Legend component
export function MapLegend() {
  const severityColors = [
    { label: 'Kritis', color: '#ef4444' },
    { label: 'Tinggi', color: '#f97316' },
    { label: 'Menengah', color: '#eab308' },
    { label: 'Ringan', color: '#22c55e' },
  ];

  return (
    <Card className="absolute bottom-4 left-4 z-[1000] w-40">
      <CardContent className="p-3">
        <p className="font-semibold mb-2 text-sm">Severity</p>
        <div className="space-y-1">
          {severityColors.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Fullscreen toggle
export function FullscreenToggle({ 
  isFullscreen, 
  onToggle 
}: { 
  isFullscreen: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-4 left-4 z-[1000] p-2 bg-white rounded-lg shadow-md hover:bg-slate-100"
    >
      {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
    </button>
  );
}

export default LayerControls;