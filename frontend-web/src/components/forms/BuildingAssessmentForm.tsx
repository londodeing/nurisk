import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, Save, Loader2, Camera,
  CheckCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useOfflineQueue } from '@/hooks/use-offline-queue';

// Damage categories with scores
const DAMAGE_CATEGORIES = [
  { id: 'foundation', label: 'Fondasi', score: 25 },
  { id: 'walls', label: 'Dinding', score: 20 },
  { id: 'roof', label: 'Atap', score: 20 },
  { id: 'floor', label: 'Lantai', score: 15 },
  { id: 'electrical', label: 'Listrik', score: 10 },
  { id: 'plumbing', label: 'Pipa Air', score: 10 },
] as const;

const DAMAGE_LEVELS = [
  { value: 'none', label: 'Tidak Rusak', score: 0, color: 'bg-green-500' },
  { value: 'minor', label: 'Ringan', score: 1, color: 'bg-yellow-500' },
  { value: 'moderate', label: 'Sedang', score: 2, color: 'bg-orange-500' },
  { value: 'severe', label: 'Berat', score: 3, color: 'bg-red-500' },
  { value: 'collapsed', label: 'Runtuh', score: 4, color: 'bg-red-800' },
] as const;

const BUILDING_TYPES = [
  { value: 'residential', label: 'Rumah Tinggal' },
  { value: 'commercial', label: 'Komersial' },
  { value: 'government', label: 'Gedung Pemerintah' },
  { value: 'school', label: 'Sekolah' },
  { value: 'mosque', label: 'Masjid' },
  { value: 'hospital', label: 'Rumah Sakit' },
  { value: 'warehouse', label: 'Gudang' },
  { value: 'other', label: 'Lainnya' },
] as const;

const CONSTRUCTION_TYPES = [
  { value: 'concrete', label: 'Beton' },
  { value: 'brick', label: 'Bata' },
  { value: 'wood', label: 'Kayu' },
  { value: 'bamboo', label: 'Bambu' },
  { value: 'mixed', label: 'Campuran' },
] as const;

const OCCUPANT_STATUS = [
  { value: 'empty', label: 'Kosong' },
  { value: 'occupied', label: 'Ditempati' },
  { value: 'evacuated', label: 'Dievakuasi' },
  { value: 'unknown', label: 'Tidak Diketahui' },
] as const;

interface FormData {
  buildingName: string;
  address: string;
  latitude: number;
  longitude: number;
  buildingType: string;
  constructionType: string;
  damageLevel: string;
  damageDetails: string[];
  occupantStatus: string;
  injuredCount: number;
  deadCount: number;
  missingCount: number;
  notes: string;
  photos: string[];
}

export function BuildingAssessmentForm({ incidentId }: { incidentId?: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToQueue } = useOfflineQueue();
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    buildingName: '',
    address: '',
    latitude: 0,
    longitude: 0,
    buildingType: '',
    constructionType: '',
    damageLevel: 'none',
    damageDetails: [],
    occupantStatus: 'unknown',
    injuredCount: 0,
    deadCount: 0,
    missingCount: 0,
    notes: '',
    photos: [],
  });

  // Calculate damage score
  const calculateScore = () => {
    const levelScore = DAMAGE_LEVELS.find(l => l.value === formData.damageLevel)?.score || 0;
    const detailScore = formData.damageDetails.reduce((sum, d) => {
      const cat = DAMAGE_CATEGORIES.find(c => c.id === d);
      return sum + (cat?.score || 0);
    }, 0);
    return levelScore * 10 + detailScore;
  };

  const damageScore = calculateScore();
  const priority = damageScore >= 70 ? 'HIGH' : damageScore >= 40 ? 'MEDIUM' : 'LOW';

  // Auto-save draft
  useEffect(() => {
    const draftKey = `assessment_draft_${incidentId || 'new'}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setDraftSaved(true);
      } catch {
        // ignore parse errors
      }
    }
  }, [incidentId]);

  const saveDraft = () => {
    const draftKey = `assessment_draft_${incidentId || 'new'}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    setDraftSaved(true);
    toast({ title: 'Draft disimpan', variant: 'success' });
  };

  const handleInputChange = (field: keyof FormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDraftSaved(false);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e.target.name as keyof FormData, e.target.value);
  };

  const handleDamageDetailToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      damageDetails: prev.damageDetails.includes(id)
        ? prev.damageDetails.filter(d => d !== id)
        : [...prev.damageDetails, id],
    }));
    setDraftSaved(false);
  };

  // Submit mutation
  const submitAssessment = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        incidentId,
        damageScore: damageScore,
        priority,
        assessorName: 'Current User',
        assessmentDate: new Date().toISOString(),
      };
      
      if (!navigator.onLine) {
        addToQueue('POST', '/buildings', payload);
        throw new Error('offline');
      }
      
      return api.post('/buildings', payload);
    },
    onSuccess: () => {
      toast({ title: 'Assessment submitted', variant: 'success' });
      const draftKey = `assessment_draft_${incidentId || 'new'}`;
      localStorage.removeItem(draftKey);
      navigate(-1);
    },
    onError: (error: Error) => {
      if (error.message === 'offline') {
        toast({ title: 'Disimpan untuk sync nanti', variant: 'success' });
        navigate(-1);
      } else {
        toast({ title: 'Gagal submit', variant: 'destructive' });
      }
    },
    onSettled: () => setSaving(false),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    submitAssessment.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Building Assessment</h2>
          <p className="text-sm text-slate-500">Form penilaian kerusakan bangunan</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={saveDraft}>
            <Save className="w-4 h-4 mr-2" />
            {draftSaved ? 'Tersimpan' : 'Simpan Draft'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Bangunan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buildingName">Nama Bangunan</Label>
              <Input
                id="buildingName"
                value={formData.buildingName}
                onChange={(e) => handleInputChange('buildingName', e.target.value)}
                placeholder="Nama/ID bangunan"
                required
              />
            </div>
            <div>
              <Label htmlFor="buildingType">Tipe Bangunan</Label>
              <select
                id="buildingType"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleSelectChange}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih tipe</option>
                {BUILDING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Alamat</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Alamat lengkap"
                required
              />
              <Button type="button" variant="outline">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="constructionType">Jenis Konstruksi</Label>
              <select
                id="constructionType"
                name="constructionType"
                value={formData.constructionType}
                onChange={handleSelectChange}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih konstruksi</option>
                {CONSTRUCTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="occupantStatus">Status Penghuni</Label>
              <select
                id="occupantStatus"
                name="occupantStatus"
                value={formData.occupantStatus}
                onChange={handleSelectChange}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {OCCUPANT_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Penilaian Kerusakan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tingkat Kerusakan</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {DAMAGE_LEVELS.map((level) => (
                <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="damageLevel"
                    value={level.value}
                    checked={formData.damageLevel === level.value}
                    onChange={() => handleInputChange('damageLevel', level.value)}
                    className="sr-only"
                  />
                  <span className={`w-3 h-3 rounded-full ${level.color} ${formData.damageLevel === level.value ? 'ring-2 ring-offset-2 ring-nu-green' : ''}`} />
                  <span className="text-sm">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Detail Kerusakan</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {DAMAGE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={cat.id}
                    checked={formData.damageDetails.includes(cat.id)}
                    onCheckedChange={() => handleDamageDetailToggle(cat.id)}
                  />
                  <Label htmlFor={cat.id} className="cursor-pointer">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Casualties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Korban Jiwa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="injured">Luka</Label>
              <Input
                id="injured"
                type="number"
                min="0"
                value={formData.injuredCount}
                onChange={(e) => handleInputChange('injuredCount', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="dead">Meninggal</Label>
              <Input
                id="dead"
                type="number"
                min="0"
                value={formData.deadCount}
                onChange={(e) => handleInputChange('deadCount', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="missing">Hilang</Label>
              <Input
                id="missing"
                type="number"
                min="0"
                value={formData.missingCount}
                onChange={(e) => handleInputChange('missingCount', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumentasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Foto Dokumentasi</Label>
            <div className="border-2 border-dashed rounded-lg p-4 mt-2 text-center">
              <Camera className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm text-slate-500 mt-2">
                Klik untuk upload foto
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={() => {
                  // Handle file upload
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Summary */}
      <Card className={priority === 'HIGH' ? 'border-red-500 bg-red-50' : priority === 'MEDIUM' ? 'border-amber-500 bg-amber-50' : 'border-green-500 bg-green-50'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Damage Score</p>
              <p className="text-3xl font-bold">{damageScore}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Prioritas</p>
              <p className={`text-xl font-bold ${
                priority === 'HIGH' ? 'text-red-600' : 
                priority === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'
              }`}>
                {priority}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Batal
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Assessment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}