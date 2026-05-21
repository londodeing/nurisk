import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import useWarehouses from '../api/useWarehouses';

export default function WarehouseListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput) params.set('search', searchInput);
      else params.delete('search');
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useWarehouses({ page, limit: 10 });

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params, { replace: true });
  };

  const warehouses = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-700">Gudang</h1>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari gudang..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" />
        </div>
        {['', 'food', 'non-food', 'medical'].map((t) => (
          <button key={t} onClick={() => setFilter('type', t === type ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              type === t ? 'bg-nu-green text-white border-nu-green' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          <p>Gagal memuat data gudang.</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">Coba lagi</button>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada gudang ditemukan</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Region</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w: any) => (
                <tr key={w.id} onClick={() => navigate(`/warehouses/${w.id}`)} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-700">{w.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{w.type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{w.region || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      w.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                    }`}>{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-slate-500">Halaman {pagination.page} dari {pagination.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
