import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  MoreVertical,
  User,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Volunteer, VolunteerStatus, VolunteerType } from '@/hooks/use-volunteers';
import { cn } from '@/lib/utils';

interface VolunteerListProps {
  volunteers: Volunteer[];
  isLoading?: boolean;
  onBulkAction?: (ids: string[], action: 'activate' | 'deactivate') => void;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

const STATUS_CONFIG: Record<VolunteerStatus, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Aktif', color: 'text-green-600', bg: 'bg-green-50' },
  DEPLOYED: { label: 'Diterjunkan', color: 'text-blue-600', bg: 'bg-blue-50' },
  ON_DUTY: { label: 'Bertugas', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  OFF_DUTY: { label: 'Libur', color: 'text-slate-500', bg: 'bg-slate-50' },
  INACTIVE: { label: 'Tidak Aktif', color: 'text-red-600', bg: 'bg-red-50' },
};

const TYPE_CONFIG: Record<VolunteerType, { label: string; color: string }> = {
  RELAWAN_PBNU: { label: 'Relawan PBNU', color: 'text-green-600' },
  RELAWAN_PCNU: { label: 'Relawan PCNU', color: 'text-blue-600' },
  RELAWAN_CABANG: { label: 'Relawan Cabang', color: 'text-purple-600' },
  RELAWAN_DESA: { label: 'Relawan Desa', color: 'text-orange-600' },
};

export function VolunteerList({
  volunteers,
  isLoading,
  onBulkAction,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
}: VolunteerListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(volunteers.map((v) => v.id)));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === volunteers.length);
  };

  const handleBulkActivate = () => {
    onBulkAction?.(Array.from(selectedIds), 'activate');
    setSelectedIds(new Set());
    setSelectAll(false);
  };

  const handleBulkDeactivate = () => {
    onBulkAction?.(Array.from(selectedIds), 'deactivate');
    setSelectedIds(new Set());
    setSelectAll(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-100 border-b" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-nu-green/10 border-b border-nu-green/20 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-nu-green">
            {selectedIds.size} dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Aktifkan
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Nonaktifkan
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-nu-green focus:ring-nu-green"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Peran
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Lokasi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                Kontak
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  Tidak ada data relawan
                </td>
              </tr>
            ) : (
              volunteers.map((volunteer) => {
                const statusConfig = STATUS_CONFIG[volunteer.status] ?? STATUS_CONFIG.INACTIVE;
                const typeConfig = TYPE_CONFIG[volunteer.type] ?? TYPE_CONFIG.RELAWAN_DESA;
                const location = [volunteer.province, volunteer.regency, volunteer.district]
                  .filter(Boolean)
                  .join(', ') || '-';
                const isSelected = selectedIds.has(volunteer.id);

                return (
                  <tr
                    key={volunteer.id}
                    className={cn(
                      'border-b border-slate-100 hover:bg-slate-50 transition-colors',
                      isSelected && 'bg-nu-green/5'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(volunteer.id)}
                        className="w-4 h-4 rounded border-slate-300 text-nu-green focus:ring-nu-green"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/admin/volunteers/${volunteer.id}`}
                        className="flex items-center gap-3 hover:text-nu-green"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">
                            {volunteer.name}
                          </p>
                          <p className="text-sm text-slate-500">{volunteer.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', typeConfig.color)}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                          statusConfig.color,
                          statusConfig.bg
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {volunteer.phone || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/dashboard/admin/volunteers/${volunteer.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Halaman {page} dari {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerList;