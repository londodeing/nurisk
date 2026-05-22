import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Layers, Home, Cloud, Flame, AlertTriangle, MapPin, Search, Crosshair, X } from 'lucide-react';
import { useIncidents } from '@/hooks/use-incidents';
import api from '@/services/api';
import type { Incident, PriorityLevel } from '@nurisk/shared-types/incident';
import 'leaflet/dist/leaflet.css';

// Canonical severity colors
const severityColors: Record<PriorityLevel, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const INDONESIA_CENTER: [number, number] = [-7.5755, 110.8243];
const DEFAULT_ZOOM = 10;

export default function PublicMap() {
  const [, setSelectedIncident] = useState<Incident | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layers, setLayers] = useState({
    incidents: true,
    shelters: false,
    weather: false,
    heatmap: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{lat: number; lng: number; name: string}[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const { data: incidentsData, isLoading } = useIncidents({ status: 'REPORTED' });

  // Initialize Leaflet map (only once, guarded by ref)
  useEffect(() => {
    if (!mapDivRef.current || mapInstanceRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: INDONESIA_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup: destroy map on unmount to prevent memory leaks
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when incident data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layers.incidents) return;

    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    } else {
      markerLayerRef.current = L.layerGroup().addTo(map);
    }

    const incidents = incidentsData?.items || [];
    incidents.forEach(incident => {
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
          <a href="/incidents/${incident.id}" style="color:#006432;font-size:13px;margin-top:8px;display:block">Lihat Detail →</a>
        </div>
      `);

      marker.on('click', () => setSelectedIncident(incident));
      markerLayerRef.current?.addLayer(marker);
    });
  }, [incidentsData, layers.incidents]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleLayer = useCallback((layer: string) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer as keyof typeof prev] }));
  }, []);

  // Search location
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get('/locations/search', { params: { q: query } });
      setSearchResults(res.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  // Current location
  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current?.flyTo([latitude, longitude], 14);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Apply search query with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-50`}>
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">← Kembali</Link>
            <h1 className="text-xl font-bold">Peta Wilayah Jawa Tengah</h1>
          </div>
          <nav className="flex gap-4">
            <Link to="/lapor" className="hover:underline">Lapor</Link>
            <Link to="/login" className="hover:underline">Masuk</Link>
          </nav>
        </div>
      </header>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-64px)]">
        <div ref={mapDivRef} className="h-full w-full" />

        {/* Layer Controls */}
        <Card className="absolute top-4 right-4 z-[1000] w-36">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
              <Layers className="w-4 h-4" />
              Layers
            </div>
            <div className="space-y-1">
              <button
                onClick={() => toggleLayer('incidents')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  layers.incidents ? 'bg-nu-green text-white' : 'bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Kejadian
              </button>
              <button
                onClick={() => toggleLayer('shelters')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  layers.shelters ? 'bg-nu-green text-white' : 'bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Posko
              </button>
              <button
                onClick={() => toggleLayer('weather')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  layers.weather ? 'bg-nu-green text-white' : 'bg-slate-100'
                }`}
              >
                <Cloud className="w-4 h-4" />
                Cuaca
              </button>
              <button
                onClick={() => toggleLayer('heatmap')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  layers.heatmap ? 'bg-nu-green text-white' : 'bg-slate-100'
                }`}
              >
                <Flame className="w-4 h-4" />
                Heatmap
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 z-[1000] w-36">
          <CardContent className="p-3">
            <p className="font-semibold mb-2 text-sm">Severity</p>
            <div className="space-y-1">
              {Object.entries(severityColors).map(([severity, color]) => (
                <div key={severity} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{severity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Box */}
        <div className="absolute top-4 left-4 z-[1000] w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
            {/* Search Results */}
            {showSearch && searchResults.length > 0 && (
              <Card className="absolute top-full mt-1 w-full max-h-48 overflow-auto">
                <CardContent className="p-1">
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        mapInstanceRef.current?.flyTo([result.lat, result.lng], 14);
                        setShowSearch(false);
                        setSearchQuery(result.name);
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                    >
                      {result.name}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          className="absolute top-4 left-72 z-[1000] p-2 bg-white rounded-lg shadow-md hover:bg-slate-100"
          title="Lokasi saya"
        >
          <Crosshair className="w-5 h-5 text-slate-600" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-[340px] z-[1000] p-2 bg-white rounded-lg shadow-md hover:bg-slate-100"
        >
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>

        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-white/50 flex items-center justify-center text-sm text-slate-500">
            Memuat data...
          </div>
        )}
      </div>

      {/* Report CTA */}
      <div className="fixed bottom-6 right-6 z-[1000]">
        <Link to="/lapor">
          <Button size="lg" className="bg-nu-green hover:bg-nu-green/90">
            <AlertTriangle className="w-5 h-5 mr-2" />
            LAPOR BENCANA
          </Button>
        </Link>
      </div>
    </div>
  );
}
