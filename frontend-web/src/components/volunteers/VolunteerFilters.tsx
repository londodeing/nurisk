import { Search, X } from 'lucide-react';
import { VolunteerStatus, VolunteerType } from '@/hooks/use-volunteers';

export interface VolunteerFilterState {
  status?: VolunteerStatus;
  type?: VolunteerType;
  province?: string;
  regency?: string;
  district?: string;
  search?: string;
}

interface VolunteerFiltersProps {
  filters: VolunteerFilterState;
  onFilterChange: (filters: VolunteerFilterState) => void;
  locations?: string[];
}

const STATUS_OPTIONS: { value: VolunteerStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'DEPLOYED', label: 'Diterjunkan' },
  { value: 'ON_DUTY', label: 'Bertugas' },
  { value: 'OFF_DUTY', label: 'Libur' },
  { value: 'INACTIVE', label: 'Tidak Aktif' },
];

const TYPE_OPTIONS: { value: VolunteerType; label: string }[] = [
  { value: 'RELAWAN_PBNU', label: 'Relawan PBNU' },
  { value: 'RELAWAN_PCNU', label: 'Relawan PCNU' },
  { value: 'RELAWAN_CABANG', label: 'Relawan Cabang' },
  { value: 'RELAWAN_DESA', label: 'Relawan Desa' },
];

export function VolunteerFilters({
  filters,
  onFilterChange,
  locations = [],
}: VolunteerFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleStatusChange = (status?: VolunteerStatus) => {
    onFilterChange({ ...filters, status });
  };

  const handleTypeChange = (type?: VolunteerType) => {
    onFilterChange({ ...filters, type });
  };

  const handleProvinceChange = (province?: string) => {
    onFilterChange({ ...filters, province });
  };

  const clearFilters = () => {
    onFilterChange({ search: '' });
  };

  const hasActiveFilters =
    filters.status || filters.type || filters.province || filters.search;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as VolunteerStatus || undefined)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Tipe
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value as VolunteerType || undefined)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
          >
            <option value="">Semua Tipe</option>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Province Filter */}
        {locations.length > 0 && (
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Provinsi
            </label>
            <select
              value={filters.province || ''}
              onChange={(e) => handleProvinceChange(e.target.value || undefined)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nu-green/50 focus:border-nu-green"
            >
              <option value="">Semua Provinsi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Hapus Filter</span>
        </button>
      )}
    </div>
  );
}

export default VolunteerFilters;