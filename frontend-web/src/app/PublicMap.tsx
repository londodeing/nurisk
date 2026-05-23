import { useState, useCallback, useRef, useEffect } from 'react';
import * as L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layers, Search, Crosshair, X, ChevronDown, ChevronUp, AlertTriangle, MapPin } from 'lucide-react';
import { wmsLayersConfig, WmsLayerItem } from '@/components/map/WmsOverlay';
import { useIncidents } from '@/hooks/use-incidents';
import { useBmkgEarthquakes } from '@/hooks/use-bmkg';
import api from '@/services/api';
import type { PriorityLevel } from '@nurisk/shared-types/incident';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<PriorityLevel, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const INDONESIA_CENTER: [number, number] = [-7.5755, 110.8243];
const DEFAULT_ZOOM = 10;

export default function PublicMap() {
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [layers, setLayers] = useState(wmsLayersConfig.map(l => ({ ...l })));
  const [showIncidents, setShowIncidents] = useState(true);
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const earthquakeLayerRef = useRef<L.LayerGroup | null>(null);
  const wmsLayersRef = useRef<L.TileLayer[]>([]);

  const { data: incidentsData, isLoading } = useIncidents({ status: 'REPORTED' });
  const { earthquakes } = useBmkgEarthquakes();

  // Initialize map once (imperative, guarded by ref — safe in Strict Mode)
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: INDONESIA_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
    earthquakeLayerRef.current = L.layerGroup().addTo(map);

    // Add WMS layers
    layers.forEach(layer => {
      if (layer.visible) {
        const wms = L.tileLayer.wms('https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms', {
          layers: layer.layerName,
          format: layer.format,
          transparent: layer.transparent,
          opacity: layer.opacity,
          version: '1.1.1',
          styles: layer.styles,
        }).addTo(map);
        wmsLayersRef.current.push(wms);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      earthquakeLayerRef.current = null;
      wmsLayersRef.current = [];
    };
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update incident markers when data changes
  useEffect(() => {
    const markerLayer = markerLayerRef.current;
    if (!markerLayer || !mapRef.current) return;

    markerLayer.clearLayers();

    if (!showIncidents) return;

    const incidents = incidentsData?.items || [];
    incidents.forEach((incident) => {
      const color = severityColors[incident.severity] || '#6b7280';
      const marker = L.circleMarker([incident.location.lat, incident.location.lng], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      });

      marker.bindPopup(`
        <div style="min-width:180px">
          <h3 style="font-weight:600;margin-bottom:4px">${incident.title}</h3>
          <p style="font-size:13px;color:#64748b">${incident.location.address ?? `${incident.location.lat}, ${incident.location.lng}`}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <span style="background:${color};color:white;padding:2px 8px;border-radius:4px;font-size:12px">${incident.severity}</span>
            <span style="font-size:12px">${incident.type}</span>
          </div>
        </div>
      `);

      markerLayer.addLayer(marker);
    });
  }, [incidentsData, showIncidents]);

  // Update BMKG earthquake markers
  useEffect(() => {
    const eqLayer = earthquakeLayerRef.current;
    if (!eqLayer || !mapRef.current) return;

    eqLayer.clearLayers();

    if (!showEarthquakes) return;

    earthquakes.forEach((quake) => {
      const magColor = quake.magnitude < 3 ? '#22c55e' :
        quake.magnitude < 5 ? '#eab308' :
        quake.magnitude < 7 ? '#f97316' : '#dc2626';
      const radius = quake.magnitude < 3 ? 8 :
        quake.magnitude < 5 ? 12 :
        quake.magnitude < 7 ? 16 : 24;

      const marker = L.circleMarker([quake.lat, quake.lon], {
        radius,
        fillColor: magColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9,
      });

      marker.bindPopup(`
        <div style="min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:${magColor};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px">${quake.magnitude.toFixed(1)}</div>
            <div>
              <p style="font-weight:600;font-size:13px;margin:0">Gempa Bumi</p>
              <p style="font-size:11px;color:#64748b;margin:0">${new Date(quake.dateTime).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
            </div>
          </div>
          <p style="font-size:12px;margin:2px 0"><strong>Lokasi:</strong> ${quake.location}</p>
          <p style="font-size:12px;margin:2px 0"><strong>Kedalaman:</strong> ${quake.depth} km</p>
          <p style="font-size:12px;margin:2px 0"><strong>Magnitudo:</strong> ${quake.magnitude.toFixed(1)} SR</p>
          ${quake.potentialTsunami === 'tsunami' ? '<div style="display:flex;align-items:center;gap:4px;margin-top:6px;color:#dc2626;font-weight:600;font-size:12px">⚠️ POTENSI TSUNAMI</div>' : ''}
        </div>
      `);

      eqLayer.addLayer(marker);
    });
  }, [earthquakes, showEarthquakes]);

  // Update WMS layers when toggled/opacity changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing WMS layers
    wmsLayersRef.current.forEach(wms => map.removeLayer(wms));
    wmsLayersRef.current = [];

    // Add active WMS layers
    layers.filter(l => l.visible).forEach(layer => {
      const wms = L.tileLayer.wms('https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms', {
        layers: layer.layerName,
        format: layer.format,
        transparent: layer.transparent,
        opacity: layer.opacity,
        version: '1.1.1',
        styles: layer.styles,
      }).addTo(map);
      wmsLayersRef.current.push(wms);
    });
  }, [layers]);

  const handleLayerToggle = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get('/locations/search', { params: { q: query } });
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.flyTo([latitude, longitude], 14);
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const visibleWmsLayers = layers.filter(l => l.visible);

  return (
    <div className="relative h-[calc(100vh-3.5rem-5rem)] md:h-[calc(100vh-3.5rem)] w-full">
      {/* Map container */}
      <div ref={mapDivRef} className="h-full w-full" />

      {isLoading && (
        <div className="absolute inset-0 z-[1000] bg-white/50 flex items-center justify-center pointer-events-none">
          <span className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg shadow">Memuat data...</span>
        </div>
      )}

      {/* Search Box */}
      <div className="absolute top-3 left-3 z-[1000] w-56 md:w-72">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="pl-9 pr-9 h-9 text-sm bg-white/95 shadow-sm border-slate-300"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          {showSearch && searchResults.length > 0 && (
            <Card className="absolute top-full mt-1 w-full max-h-48 overflow-auto shadow-lg">
              <CardContent className="p-1">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      mapRef.current?.flyTo([result.lat, result.lng], 14);
                      setShowSearch(false);
                      setSearchQuery(result.name);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {result.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Geolocation Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute top-3 left-60 md:left-80 z-[1000] p-2 bg-white/95 rounded-lg shadow-sm hover:bg-white border border-slate-200"
        title="Lokasi saya"
      >
        <Crosshair className="w-4 h-4 text-slate-600" />
      </button>

      {/* Layer Control - FAB toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setLayerPanelOpen(!layerPanelOpen)}
          className={`p-2.5 rounded-full shadow-md transition-all duration-200 ${
            layerPanelOpen ? 'bg-nu-green text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
          } border border-slate-200`}
          title="Layer Control"
        >
          {layerPanelOpen ? <ChevronDown className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
        </button>
      </div>

      {/* Layer Panel */}
      {layerPanelOpen && (
        <div className="absolute top-14 right-3 z-[1000] w-64 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              InaRISK BNPB
            </p>
            <div className="space-y-1">
              {layers.map(layer => (
                <WmsLayerItem
                  key={layer.id}
                  layer={layer}
                  onToggle={handleLayerToggle}
                  onOpacityChange={handleOpacityChange}
                />
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">LAYER LAIN</p>
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showIncidents ? 'bg-nu-green/10 text-nu-green font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Kejadian Bencana
            </button>
            <button
              onClick={() => setShowEarthquakes(!showEarthquakes)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showEarthquakes ? 'bg-orange-100 text-orange-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Gempa Bumi (BMKG)
              {showEarthquakes && earthquakes.length > 0 && (
                <span className="ml-auto text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">{earthquakes.length}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-3 z-[1000]">
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white"
        >
          {legendOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          Legenda
        </button>
        {legendOpen && (
          <Card className="mt-1 w-48 shadow-lg">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Tingkat Keparahan</p>
              <div className="space-y-1.5">
                {Object.entries(severityColors).map(([severity, color]) => (
                  <div key={severity} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-700">{severity}</span>
                  </div>
                ))}
              </div>
              {showEarthquakes && earthquakes.length > 0 && (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Magnitudo Gempa</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:'#22c55e'}} /><span className="text-xs text-slate-700">&lt; 3.0</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:'#eab308'}} /><span className="text-xs text-slate-700">3.0 - 5.0</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:'#f97316'}} /><span className="text-xs text-slate-700">5.0 - 7.0</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:'#dc2626'}} /><span className="text-xs text-slate-700">&gt; 7.0</span></div>
                  </div>
                </>
              )}
              {visibleWmsLayers.length > 0 && (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">InaRISK</p>
                  <div className="space-y-1.5">
                    {visibleWmsLayers.map(l => (
                      <div key={l.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color, opacity: l.opacity }} />
                        <span className="text-xs text-slate-700">{l.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report CTA */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[1000]">
        <a href="/lapor">
          <Button size="lg" className="bg-nu-green hover:bg-nu-green/90 shadow-lg shadow-nu-green/30 rounded-full">
            <AlertTriangle className="w-5 h-5 mr-2" />
            LAPOR
          </Button>
        </a>
      </div>
    </div>
  );
}
