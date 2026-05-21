import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Users, AlertTriangle } from 'lucide-react';
import useShelter from '../api/useShelter';

export default function ShelterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: shelter, isLoading, error } = useShelter(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-500">Shelter tidak ditemukan</p>
        <button onClick={() => navigate('/shelters')} className="mt-4 text-nu-green hover:underline text-sm">Kembali ke daftar</button>
      </div>
    );
  }

  const s = shelter as any;

  return (
    <div className="space-y-6">
      <Link to="/shelters" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 text-sm">
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Daftar</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">{s.name}</h1>
            <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              s.status === 'active' ? 'bg-green-50 text-green-600' :
              s.status === 'full' ? 'bg-amber-50 text-amber-600' :
              'bg-slate-50 text-slate-500'
            }`}>{s.status}</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Informasi</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span className="text-slate-600">{s.district || s.address || '-'}</span>
            </div>
            {s.picName && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">{s.picName}</span>
              </div>
            )}
            {s.picPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">{s.picPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Kapasitas</h2>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Terisi</span>
              <span className="font-medium">{s.currentOccupancy ?? 0} / {s.capacity ?? '-'}</span>
            </div>
            {s.capacity > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-nu-green h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((s.currentOccupancy ?? 0) / s.capacity) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
