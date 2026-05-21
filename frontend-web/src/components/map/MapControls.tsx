import { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore, selectActiveBaseLayer } from '@/stores/map-store';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Maximize, Minimize, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';

const BASE_LAYERS = [
  { id: 'base-street', label: 'Street', icon: '🗺' },
  { id: 'base-satellite', label: 'Satellite', icon: '🛰' },
  { id: 'base-hillshade', label: 'Hillshade', icon: '⛰' },
];

const OVERLAYS = [
  { id: 'batas-kota', label: 'Batas Kota' },
  { id: 'seismik', label: 'Seismik' },
  { id: 'wms-bnpb', label: 'InaRISK' },
  { id: 'radar', label: 'Radar' },
];

function ZoomControls() {
  const map = useMap();

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom In"
        className="p-2 bg-white rounded-t-lg shadow-md hover:bg-slate-100 text-slate-700 border-b border-slate-200"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        className="p-2 bg-white rounded-b-lg shadow-md hover:bg-slate-100 text-slate-700"
      >
        <ZoomOut size={18} />
      </button>
    </div>
  );
}

function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleToggle = useCallback(() => {
    const el = document.getElementById('map-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <button
      onClick={handleToggle}
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-100 text-slate-700"
    >
      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
    </button>
  );
}

export function MapControls() {
  const [panelOpen, setPanelOpen] = useState(false);
  const activeBaseLayer = useMapStore(selectActiveBaseLayer);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const layerVisibility = useMapStore((s) => s.layerVisibility);

  return (
    <>
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
        <FullscreenToggle />

        <ZoomControls />

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          title="Layer Controls"
          className={`p-2 rounded-lg shadow-md transition-colors ${
            panelOpen ? 'bg-nu-green text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers size={18} />
        </button>
      </div>

      {panelOpen && (
        <Card className="absolute top-3 left-3 z-[1000] w-56 shadow-lg">
          <CardContent className="p-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Base Layer
              </p>
              <div className="space-y-1">
                {BASE_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeBaseLayer?.id === layer.id
                        ? 'bg-nu-green text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{layer.icon}</span>
                    {layer.label}
                    {activeBaseLayer?.id === layer.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Overlay
              </p>
              <div className="space-y-1">
                {OVERLAYS.map((overlay) => {
                  const visible = layerVisibility[overlay.id] ?? false;
                  return (
                    <button
                      key={overlay.id}
                      onClick={() => toggleLayer(overlay.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        visible
                          ? 'bg-nu-green/10 text-nu-green'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      {overlay.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default MapControls;
