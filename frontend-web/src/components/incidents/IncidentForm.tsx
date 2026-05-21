import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  Save, 
  X,
  Loader2
} from 'lucide-react';

import { useIncident } from '@/features/incidents/hooks/useIncident';
import { useCreateIncident } from '@/features/incidents/hooks/useCreateIncident';
import { useUpdateIncident } from '@/features/incidents/hooks/useUpdateIncident';
import type { CreateIncidentRequest, DisasterType } from '@nurisk/shared-types/incident';
import { useToast } from '@/hooks/use-toast';

// Default form data matching CreateIncidentRequest structure
const defaultFormData: CreateIncidentRequest = {
  title: '',
  description: '',
  type: 'BANJIR' as DisasterType,
  location: {
    lat: 0,
    lng: 0,
    address: '',
  },
};

// Canonical disaster types
const incidentTypes: { value: DisasterType; label: string }[] = [
  { value: 'BANJIR', label: 'Banjir' },
  { value: 'LONGSOR', label: 'Tanah Longsor' },
  { value: 'GEMPA', label: 'Gempa Bumi' },
  { value: 'TSUNAMI', label: 'Tsunami' },
  { value: 'VOLKANO', label: 'Erupsi Gunung Api' },
  { value: 'KEBAKARAN_HUTAN', label: 'Kebakaran Hutan' },
  { value: 'KEBAKARAN_BANGUNAN', label: 'Kebakaran Bangunan' },
  { value: 'EKSTREM_CUACA', label: 'Ekstrem Cuaca' },
  { value: 'WABAH_PENYAKIT', label: 'Wabah Penyakit' },
];

// Severity is not part of CreateIncidentRequest - handled by backend or separate flow

export function IncidentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateIncidentRequest>(defaultFormData);

  // Fetch existing incident for edit
  const { data: existingIncident } = useIncident(isEdit ? id : undefined);
  
  useEffect(() => {
    if (existingIncident) {
      setFormData({
        title: existingIncident.title || '',
        type: existingIncident.type || 'BANJIR',
        description: existingIncident.description || '',
        location: {
          lat: existingIncident.location?.lat || 0,
          lng: existingIncident.location?.lng || 0,
          address: existingIncident.location?.address || '',
        },
      });
      setLoading(false);
    }
  }, [existingIncident]);

  const handleChange = (field: keyof CreateIncidentRequest, value: string) => {
    if (field === 'location') {
      setFormData(prev => ({ 
        ...prev, 
        location: { ...prev.location!, address: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = value ? parseFloat(value) : 0;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location!, [field]: numValue }
    }));
  };

  // Save mutations
  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();
  
  const handleSubmit = async (data: CreateIncidentRequest): Promise<void> => {
    try {
      if (isEdit) {
        const updatePayload = {
          title: data.title,
          description: data.description,
          type: data.type,
          location: {
            ...data.location,
            address: data.location.address || '',
          },
        };
        await updateIncident.mutateAsync({ id, data: updatePayload });
      } else {
        const createPayload = {
          title: data.title,
          description: data.description,
          type: data.type,
          location: {
            ...data.location,
            address: data.location.address || '',
          },
          images: [],
        };
        await createIncident.mutateAsync(createPayload);
      }
      
      toast({ 
        title: isEdit ? 'Incident diupdate' : 'Incident dibuat', 
        variant: 'success' 
      });
      navigate('/incidents');
    } catch {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    handleSubmit(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nu-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              {isEdit ? 'Edit Incident' : 'Buat Incident Baru'}
            </h1>
            <p className="text-sm opacity-80">
              {isEdit ? 'Update informasi incident' : 'Laporkan kejadian baru'}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/incidents')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Incident</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Judul incident"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Jenis *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <option value="">Pilih jenis incident</option>
                  {incidentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi *</Label>
                <Input
                  id="location"
                  value={formData.location?.address || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Alamat lengkap"
                  required
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.location?.lat || ''}
                    onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                    placeholder="-6.2..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.location?.lng || ''}
                    onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                    placeholder="106.8..."
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Deskripsi detail incident..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEdit ? 'Update' : 'Simpan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/incidents')}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}

export default IncidentForm;