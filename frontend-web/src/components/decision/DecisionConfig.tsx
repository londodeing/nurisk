'use client';

import { useState } from 'react';
import { useDecisionConfig } from '@/hooks/use-decision';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Bell, Shield, Zap, Save } from 'lucide-react';

export function DecisionConfig() {
  const { config, loading, saving, updateConfig, error } = useDecisionConfig();
  const [localConfig, setLocalConfig] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: unknown) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!localConfig) return;
    try {
      await updateConfig(localConfig);
      setSaved(true);
      setLocalConfig(null);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !config) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          Gagal memuat konfigurasi
        </CardContent>
      </Card>
    );
  }

  const currentConfig = localConfig || config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi Decision Engine</CardTitle>
        <CardDescription>Pengaturan untuk pengambilan keputusan otomatis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Decision */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium">Auto Decision</p>
                <p className="text-sm text-gray-500">Izinkan AI membuat keputusan otomatis</p>
              </div>
            </div>
            <button
              onClick={() => handleChange('autoDecisionEnabled', !currentConfig.autoDecisionEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                currentConfig.autoDecisionEnabled ? 'bg-nu-green' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  currentConfig.autoDecisionEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Confidence Threshold */}
        <div>
          <label className="block font-medium mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Threshold Kepercayaan AI
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={currentConfig.confidenceThreshold as number}
              onChange={(e) => handleChange('confidenceThreshold', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">
              {currentConfig.confidenceThreshold}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Keputusan dengan kepercayaan di atas threshold akan dibuat otomatis
          </p>
        </div>

        {/* High Risk Threshold */}
        <div>
          <label className="block font-medium mb-2">Threshold Risiko Tinggi</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={currentConfig.highRiskThreshold as number}
              onChange={(e) => handleChange('highRiskThreshold', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">
              {currentConfig.highRiskThreshold}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Keputusan dengan risiko di atas threshold memerlukan persetujuan manual
          </p>
        </div>

        {/* Require Approval for High Risk */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Persetujuan untuk Risiko Tinggi</p>
            <p className="text-sm text-gray-500">Memerlukan persetujuan untuk keputusan berisiko tinggi</p>
          </div>
          <button
            onClick={() => handleChange('requireApprovalForHighRisk', !currentConfig.requireApprovalForHighRisk)}
            className={`w-12 h-6 rounded-full transition-colors ${
              currentConfig.requireApprovalForHighRisk ? 'bg-nu-green' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                currentConfig.requireApprovalForHighRisk ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Notification Settings */}
        <div>
          <label className="block font-medium mb-2">
            <Bell className="w-4 h-4 inline mr-2" />
            Notifikasi
          </label>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm">Kirim notifikasi saat ada keputusan baru</p>
            <button
              onClick={() => handleChange('notifyOnDecision', !currentConfig.notifyOnDecision)}
              className={`w-12 h-6 rounded-full transition-colors ${
                currentConfig.notifyOnDecision ? 'bg-nu-green' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  currentConfig.notifyOnDecision ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        {localConfig && (
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        )}

        {saved && (
          <p className="text-center text-green-600">Konfigurasi berhasil disimpan</p>
        )}
      </CardContent>
    </Card>
  );
}