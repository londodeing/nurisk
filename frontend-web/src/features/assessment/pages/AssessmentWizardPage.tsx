import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import useCreateAssessment from '../api/useCreateAssessment';

const STEPS = [
  { id: 'structure', label: 'Struktur' },
  { id: 'utilities', label: 'Utilitas' },
  { id: 'access', label: 'Akses' },
  { id: 'hazards', label: 'Bahaya' },
  { id: 'occupants', label: 'Penghuni' },
  { id: 'photos', label: 'Foto' },
];

const STORAGE_KEY = 'assessment-draft';

export default function AssessmentWizardPage() {
  const { id: incidentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createAssessment = useCreateAssessment();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}-${incidentId}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-${incidentId}`, JSON.stringify(form));
  }, [form, incidentId]);

  const update = (section: string, field: string, value: any) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      await createAssessment.mutateAsync({ incidentId, ...form });
      localStorage.removeItem(`${STORAGE_KEY}-${incidentId}`);
      navigate(`/incidents/${incidentId}`);
    } catch {
      // handled by mutation error state
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Structure
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Informasi Struktur</h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tipe Bangunan</label>
              <select value={form.structure?.type || ''} onChange={(e) => update('structure', 'type', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">Pilih...</option>
                <option value="residential">Rumah Tinggal</option>
                <option value="commercial">Komersial</option>
                <option value="public">Fasilitas Umum</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Jumlah Lantai</label>
              <input type="number" value={form.structure?.floors || ''} onChange={(e) => update('structure', 'floors', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tingkat Kerusakan</label>
              <select value={form.structure?.damageLevel || ''} onChange={(e) => update('structure', 'damageLevel', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">Pilih...</option>
                <option value="none">Tidak Rusak</option>
                <option value="minor">Rusak Ringan</option>
                <option value="moderate">Rusak Sedang</option>
                <option value="severe">Rusak Berat</option>
                <option value="collapsed">Roboh</option>
              </select>
            </div>
          </div>
        );
      case 1: // Utilities
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Utilitas</h3>
            {['water', 'electricity', 'gas'].map((util) => (
              <div key={util}>
                <label className="block text-sm text-slate-600 mb-1 capitalize">{util}</label>
                <select value={form.utilities?.[util] || ''} onChange={(e) => update('utilities', util, e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="">Pilih...</option>
                  <option value="functional">Berfungsi</option>
                  <option value="partial">Sebagian</option>
                  <option value="damaged">Rusak</option>
                  <option value="none">Tidak Ada</option>
                </select>
              </div>
            ))}
          </div>
        );
      case 2: // Access
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Akses</h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Akses Jalan</label>
              <select value={form.access?.road || ''} onChange={(e) => update('access', 'road', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">Pilih...</option>
                <option value="clear">Lancar</option>
                <option value="obstructed">Terhalang</option>
                <option value="blocked">Tertutup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Hambatan</label>
              <textarea value={form.access?.obstacles || ''} onChange={(e) => update('access', 'obstacles', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} />
            </div>
          </div>
        );
      case 3: // Hazards
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Bahaya</h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Bahaya Struktural</label>
              <textarea value={form.hazards?.structural || ''} onChange={(e) => update('hazards', 'structural', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tingkat Keamanan</label>
              <select value={form.hazards?.safetyRating || ''} onChange={(e) => update('hazards', 'safetyRating', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">Pilih...</option>
                <option value="safe">Aman</option>
                <option value="caution">Waspada</option>
                <option value="unsafe">Tidak Aman</option>
                <option value="dangerous">Berbahaya</option>
              </select>
            </div>
          </div>
        );
      case 4: // Occupants
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Penghuni</h3>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Jumlah Penghuni</label>
              <input type="number" value={form.occupants?.count || ''} onChange={(e) => update('occupants', 'count', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Kebutuhan Khusus</label>
              <textarea value={form.occupants?.specialNeeds || ''} onChange={(e) => update('occupants', 'specialNeeds', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={3} placeholder="Lansia, disabilitas, ibu hamil, dll." />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Jumlah Mengungsi</label>
              <input type="number" value={form.occupants?.displaced || ''} onChange={(e) => update('occupants', 'displaced', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        );
      case 5: // Photos
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Foto Bangunan</h3>
            <p className="text-sm text-slate-500">Ambil foto bangunan dari berbagai sudut untuk dokumentasi.</p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
              <p className="text-slate-400">Fitur upload foto akan tersedia</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-nu-green text-white' : i === step ? 'bg-nu-green/20 text-nu-green border-2 border-nu-green' : 'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-nu-green' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 px-1">
        {STEPS.map((s) => <span key={s.id}>{s.label}</span>)}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {renderStep()}

        {createAssessment.error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mt-4">
            Gagal menyimpan penilaian. Silakan coba lagi.
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate(`/incidents/${incidentId}`)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Kembali' : 'Sebelumnya'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-nu-green text-white rounded-lg hover:bg-nu-green/90"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={createAssessment.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-nu-green text-white rounded-lg hover:bg-nu-green/90 disabled:opacity-50"
          >
            {createAssessment.isPending ? 'Menyimpan...' : 'Simpan Penilaian'}
          </button>
        )}
      </div>
    </div>
  );
}
