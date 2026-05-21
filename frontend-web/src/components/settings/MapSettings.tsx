'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MapSettings {
  defaultZoom: number;
  defaultBaseLayer: string;
  units: 'metric' | 'imperial';
}

export function MapSettings() {
  const [settings, setSettings] = useState<MapSettings>({
    defaultZoom: 10,
    defaultBaseLayer: 'osm',
    units: 'metric',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('mapSettings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      localStorage.setItem('mapSettings', JSON.stringify(settings));
      setMessage('Pengaturan berhasil disimpan');
    } catch (error) {
      setMessage('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-nu-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Peta</CardTitle>
        <CardDescription>Kelola preferensi tampilan peta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Zoom */}
        <div className="space-y-2">
          <Label>Default Zoom Level</Label>
          <Input
            type="number"
            min={5}
            max={18}
            value={settings.defaultZoom}
            onChange={(e) => setSettings({ ...settings, defaultZoom: parseInt(e.target.value) })}
          />
          <p className="text-xs text-gray-500">Level zoom 5-18 (semakin besar semakin detail)</p>
        </div>

        {/* Default Base Layer */}
        <div className="space-y-2">
          <Label>Default Base Layer</Label>
          <Select
            value={settings.defaultBaseLayer}
            onValueChange={(value) => setSettings({ ...settings, defaultBaseLayer: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="osm">OpenStreetMap</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Units */}
        <div className="space-y-2">
          <Label>Satuan Jarak</Label>
          <Select
            value={settings.units}
            onValueChange={(value) => setSettings({ ...settings, units: value as 'metric' | 'imperial' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metrik (km, m)</SelectItem>
              <SelectItem value="imperial">Imperial (mi, ft)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {message && (
            <span className="text-sm text-green-600">{message}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}