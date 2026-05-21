import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateIncident } from '@/hooks/use-incidents';
import api from '@/services/api';
import 'leaflet/dist/leaflet.css';

type Step = 'type' | 'location' | 'description' | 'review';

interface ReportFormData {
  type: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: string;
  files: File[];
  reporterName: string;
  reporterPhone: string;
  isAnonymous: boolean;
}

const incidentTypes = [
  { value: 'flood', label: 'Banjir' },
  { value: 'earthquake', label: 'Gempa Bumi' },
  { value: 'landslide', label: 'Longsor' },
  { value: 'fire', label: 'Kebakaran' },
  { value: 'storm', label: 'Badai/Angin Kencang' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'eruption', label: 'Erupsi Gunung Berapi' },
  { value: 'drought', label: 'Kekeringan' },
  { value: 'haze', label: 'Kabut Asap' },
  { value: 'building_collapse', label: 'Bangunan Roboh' },
  { value: 'other', label: 'Lainnya' },
];

const severityLevels = [
  { value: 'critical', label: 'Kritis - Membutuhkan bantuan segera' },
  { value: 'high', label: 'Tinggi - Perlu bantuan cepat' },
  { value: 'medium', label: 'Menengah - Perlu perhatian' },
  { value: 'low', label: 'Ringan - Informasi saja' },
];

// Map click handler component
function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ReportForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createIncident = useCreateIncident();
  
  const [step, setStep] = useState<Step>('type');
  const [formData, setFormData] = useState<ReportFormData>({
    type: '',
    title: '',
    description: '',
    location: searchParams.get('location') || '',
    latitude: parseFloat(searchParams.get('lat') || '0'),
    longitude: parseFloat(searchParams.get('lng') || '0'),
    severity: 'MEDIUM',
    files: [],
    reporterName: '',
    reporterPhone: '',
    isAnonymous: false,
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => console.error('GPS error:', error)
      );
    }
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    // Reverse geocode (simplified)
    setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      files: prev.files.filter((_, i) => i !== index) 
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleNext = useCallback(() => {
    const steps: Step[] = ['type', 'location', 'description', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    const steps: Step[] = ['type', 'location', 'description', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Upload files first if any
      if (formData.files.length > 0) {
        const formDataUpload = new FormData();
        formData.files.forEach(file => formDataUpload.append('files', file));
        await api.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      // Create incident
      await createIncident.mutateAsync({
        type: formData.type as any,
        title: formData.title,
        description: formData.description,
        location: { lat: formData.latitude, lng: formData.longitude },
        severity: formData.severity as any,
        reportedByName: formData.reporterName || undefined,
      });
      
      navigate('/report/success');
    } catch (error) {
      console.error('Report submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createIncident, navigate]);

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-4">
            <Label className="text-lg">Jenis Kejadian</Label>
            <div className="grid grid-cols-2 gap-3">
              {incidentTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value, title: type.label }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.type === type.value 
                      ? 'border-nu-green bg-nu-green/10' 
                      : 'border-slate-200 hover:border-nu-green'
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <Label className="text-lg">Lokasi Kejadian</Label>
            <Input
              placeholder="Masukkan alamat atau klik peta"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={[formData.latitude || -7.5755, formData.longitude || 110.8243]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onLocationSelect={handleLocationSelect} />
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={[formData.latitude, formData.longitude]}
                    icon={divIcon({
                      className: 'custom-marker',
                      html: '<div style="width:20px;height:20px;background:#ef4444;border:3px solid white;border-radius:50%"></div>',
                      iconSize: [20, 20],
                    })}
                  />
                )}
              </MapContainer>
            </div>
            <p className="text-sm text-slate-500">Klik pada peta untuk memilih lokasi</p>
          </div>
        );

      case 'description':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg">Deskripsi</Label>
              <Textarea
                placeholder="Jelaskan kejadian..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="h-32"
              />
            </div>

            {/* Reporter Contact */}
            <div className="border-t pt-4 mt-4">
              <Label className="text-lg">Data Pelapor (Opsional)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked as boolean }))}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Kirim secara anonim
                </Label>
              </div>
              {!formData.isAnonymous && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label>Nama</Label>
                    <Input
                      placeholder="Nama Anda"
                      value={formData.reporterName}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>No. HP</Label>
                    <Input
                      placeholder="081234567890"
                      value={formData.reporterPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporterPhone: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="text-lg">Tingkat Keparahan</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                {severityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-lg">Foto Bukti (Opsional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <span>Klik untuk upload foto</span>
                </label>
              </div>
              {previewUrls.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ringkasan Laporan</h3>
            <Card>
              <CardContent className="p-4 space-y-2">
                <p><span className="font-medium">Jenis:</span> {incidentTypes.find(t => t.value === formData.type)?.label}</p>
                <p><span className="font-medium">Deskripsi:</span> {formData.description}</p>
                <p><span className="font-medium">Lokasi:</span> {formData.location}</p>
                <p><span className="font-medium">Koordinat:</span> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                <p><span className="font-medium">Keparahan:</span> {formData.severity}</p>
                <p><span className="font-medium">Foto:</span> {formData.files.length} file(s)</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {['type', 'location', 'description', 'review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === s ? 'bg-nu-green text-white' : 
              ['type', 'location', 'description', 'review'].indexOf(step) > i ? 'bg-nu-green/50' : 'bg-slate-200'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className="w-8 h-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 'type' && 'Pilih Jenis Kejadian'}
            {step === 'location' && 'Pilih Lokasi'}
            {step === 'description' && 'Detail Kejadian'}
            {step === 'review' && 'Konfirmasi'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-6">
            {step !== 'type' && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            )}
            {step !== 'review' ? (
              <Button 
                onClick={handleNext} 
                className="ml-auto"
                disabled={
                  (step === 'type' && !formData.type) ||
                  (step === 'location' && !formData.location)
                }
              >
                Lanjut
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}