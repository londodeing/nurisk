import { useState, useMemo } from 'react';
import { Users, Download } from 'lucide-react';
import {
  useBulkAction,
  VolunteerFilterState,
} from '@/hooks/use-volunteers';
import { useVolunteers } from '@/features/volunteers/hooks/useVolunteers';
import { VolunteerFilters } from '@/components/volunteers/VolunteerFilters';
import { VolunteerList } from '@/components/volunteers/VolunteerList';

export default function VolunteersPage() {
  const [filters, setFilters] = useState<VolunteerFilterState>({
    search: '',
    status: undefined,
    type: undefined,
    province: undefined,
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: filters.search || undefined,
      status: filters.status,
      type: filters.type,
      province: filters.province,
    }),
    [page, filters]
  );

  const { data, isLoading, refetch } = useVolunteers(queryParams);
  const bulkAction = useBulkAction();

  const volunteers = (data as any)?.data || [];
  const total = (data as any)?.pagination?.total || 0;

  const handleFilterChange = (newFilters: VolunteerFilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleBulkAction = async (ids: string[], action: 'activate' | 'deactivate') => {
    try {
      await bulkAction.mutateAsync({ ids, action });
      refetch();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nu-green/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-nu-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Manajemen Relawan</h1>
            <p className="text-sm text-slate-500">Kelola dan approve relawan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <VolunteerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* List */}
      <VolunteerList
        volunteers={volunteers}
        isLoading={isLoading}
        onBulkAction={handleBulkAction}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}