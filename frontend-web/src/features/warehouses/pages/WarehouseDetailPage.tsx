import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Package, AlertTriangle } from 'lucide-react';
import useWarehouse from '../api/useWarehouse';

export default function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: warehouse, isLoading, error } = useWarehouse(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-500">Gudang tidak ditemukan</p>
        <button onClick={() => navigate('/warehouses')} className="mt-4 text-nu-green hover:underline text-sm">Kembali ke daftar</button>
      </div>
    );
  }

  const w = warehouse as any;

  return (
    <div className="space-y-6">
      <Link to="/warehouses" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 text-sm">
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Daftar</span>
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-700">{w.name}</h1>
            <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              w.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
            }`}>{w.status}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Informasi</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-slate-400" />
              <span className="text-slate-600">{w.type || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span className="text-slate-600">{w.region || w.address || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Stok</h2>
          <p className="text-slate-500 text-sm">Informasi stok akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>
  );
}
