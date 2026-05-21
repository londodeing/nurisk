'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditDetailModal } from '@/components/audit/AuditDetailModal';
import { AuditExport } from '@/components/audit/AuditExport';
import {
  useAuditLogs,
  type AuditFilters as AuditFilterParams,
  type AuditLogEntry,
  MOCK_AUDIT_LOGS,
} from '@/hooks/use-audit-log';

export default function AuditLogPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AuditFilterParams>({});
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 50;

  // Check admin role (mock - in real app, check from auth context)
  const isAdmin = true;

  // Fetch audit logs
  const { data, isLoading, error: _error } = useAuditLogs(filters, page, limit);

  // Use mock data if API fails or no data
  const auditData = useMemo(() => {
    if (data?.data && data.data.length > 0) return data.data;
    return MOCK_AUDIT_LOGS;
  }, [data]);

  const totalPages = data?.totalPages || Math.ceil(MOCK_AUDIT_LOGS.length / limit);
  const total = data?.total || MOCK_AUDIT_LOGS.length;

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  const handleRowClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleFilterChange = (newFilters: AuditFilterParams) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
              <p className="text-sm text-gray-500 mt-1">
                Riwayat semua aktivitas dan perubahan di sistem
              </p>
            </div>
            <AuditExport data={auditData} filters={filters} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6">
          <AuditFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Entri</div>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Berhasil</div>
            <div className="text-2xl font-bold text-green-600">
              {auditData.filter((e) => e.status === 'success').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Gagal</div>
            <div className="text-2xl font-bold text-red-600">
              {auditData.filter((e) => e.status === 'failed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Halaman</div>
            <div className="text-2xl font-bold text-gray-900">
              {page} / {totalPages}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-6">
          <AuditLogTable
            data={auditData}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            selectedId={selectedEntry?.id}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Menampilkan {(page - 1) * limit + 1} -{' '}
            {Math.min(page * limit, total)} dari {total} entri
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AuditDetailModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}