/**
 * useAuditLog Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { auditApi } from '@nurisk/sdk';
import type {
  AuditAction,
  AuditLogEntry,
  AuditFilters,
  AuditStatus,
} from '@nurisk/shared-types/audit';

// Re-export from shared-types for convenience
export type { AuditFilters, AuditAction, AuditLogEntry, AuditStatus } from '@nurisk/shared-types/audit';

// ============================================
// Additional Types (not in shared-types)
// ============================================

export type AuditEntityType =
  | 'incident'
  | 'volunteer'
  | 'assessment'
  | 'shelter'
  | 'warehouse'
  | 'user'
  | 'broadcast'
  | 'config'
  | 'system';

/**
 * Audit Log Response
 */
export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query keys
 */
export const auditLogKeys = {
  all: ['auditLog'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters: AuditFilters, page: number) => [
    ...auditLogKeys.lists(),
    filters,
    page,
  ] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (id: number) => [...auditLogKeys.details(), id] as const,
};

/**
 * Get audit logs
 * SDK METHOD MISSING: pagination not available - using query as fallback
 */
async function getAuditLogs(
  filters: AuditFilters = {},
  page = 1,
  limit = 50,
): Promise<AuditLogResponse> {
  const data = await auditApi.query(filters);
  return {
    data: data.slice((page - 1) * limit, page * limit),
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
  };
}

/**
 * Get audit log by ID
 */
async function getAuditLogById(id: number): Promise<AuditLogEntry> {
  const data = await auditApi.getById(String(id));
  return data;
}

/**
 * Export audit logs to CSV
 * SDK METHOD MISSING: export returns string not Blob - using export as fallback
 */
async function exportAuditLogs(
  filters: AuditFilters = {},
): Promise<Blob> {
  const csvData = await auditApi.export(filters, 'csv');
  const blob = new Blob([csvData], { type: 'text/csv' });
  return blob;
}

/**
 * Hook: Get audit logs with filters and pagination
 */
export function useAuditLogs(filters: AuditFilters = {}, page = 1, limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.list(filters, page),
    queryFn: () => getAuditLogs(filters, page, limit),
  });
}

/**
 * Hook: Get single audit log entry
 */
export function useAuditLog(id: number) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => getAuditLogById(id),
    enabled: !!id,
  });
}

/**
 * Hook: Export audit logs
 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: exportAuditLogs,
  });
}

/**
 * Action type labels
 */
export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    CREATE_INCIDENT: 'Buat Insiden',
    UPDATE_INCIDENT: 'Update Insiden',
    DELETE_INCIDENT: 'Hapus Insiden',
    CREATE_ASSESSMENT: 'Buat Assessment',
    UPDATE_ASSESSMENT: 'Update Assessment',
    DEPLOY_VOLUNTEER: 'Deploy Relawan',
    APPROVE_VOLUNTEER: 'Approve Relawan',
    CREATE_BROADCAST: 'Buat Broadcast',
    SYSTEM_CONFIG_CHANGE: 'Ubah Konfigurasi',
    CREATE_SHELTER: 'Buat Shelter',
    UPDATE_SHELTER: 'Update Shelter',
    CREATE_WAREHOUSE: 'Buat Gudang',
    UPDATE_WAREHOUSE: 'Update Gudang',
    CREATE_USER: 'Buat User',
    UPDATE_USER: 'Update User',
    DELETE_USER: 'Hapus User',
  };
  return labels[action] || action;
}

/**
 * Entity type labels
 */
export function getEntityTypeLabel(entity: AuditEntityType): string {
  const labels: Record<AuditEntityType, string> = {
    incident: 'Insiden',
    volunteer: 'Relawan',
    assessment: 'Assessment',
    shelter: 'Shelter',
    warehouse: 'Gudang',
    user: 'User',
    broadcast: 'Broadcast',
    config: 'Konfigurasi',
    system: 'Sistem',
  };
  return labels[entity] || entity;
}

/**
 * Get action color
 */
export function getActionColor(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    LOGIN: '#22C55E',
    LOGOUT: '#6B7280',
    CREATE_INCIDENT: '#3B82F6',
    UPDATE_INCIDENT: '#F59E0B',
    DELETE_INCIDENT: '#EF4444',
    CREATE_ASSESSMENT: '#3B82F6',
    UPDATE_ASSESSMENT: '#F59E0B',
    DEPLOY_VOLUNTEER: '#8B5CF6',
    APPROVE_VOLUNTEER: '#22C55E',
    CREATE_BROADCAST: '#EC4899',
    SYSTEM_CONFIG_CHANGE: '#6366F1',
    CREATE_SHELTER: '#3B82F6',
    UPDATE_SHELTER: '#F59E0B',
    CREATE_WAREHOUSE: '#3B82F6',
    UPDATE_WAREHOUSE: '#F59E0B',
    CREATE_USER: '#3B82F6',
    UPDATE_USER: '#F59E0B',
    DELETE_USER: '#EF4444',
  };
  return colors[action] || '#6B7280';
}

/**
 * Get status color
 */
export function getStatusColor(status: AuditStatus): string {
  return status === 'success' ? '#22C55E' : '#EF4444';
}

/**
 * Mock data for development
 */
export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    actorId: '1',
    actorName: 'Admin Sistem',
    actorEmail: 'admin@nurisk.go.id',
    action: 'LOGIN',
    entityType: 'user',
    entityId: '1',
    status: 'success',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T08:30:00Z',
  },
  {
    id: '2',
    actorId: '2',
    actorName: 'Petugas Lapangan 1',
    actorEmail: 'petugas1@nurisk.go.id',
    action: 'CREATE_INCIDENT',
    entityType: 'incident',
    entityId: '101',
    changesSummary: 'Insiden banjir baru dibuat',
    beforeValue: null,
    afterValue: {
      title: 'Banjir di Jakarta Selatan',
      disasterType: 'BANJIR',
      region: 'Jakarta Selatan',
      severity: 'HIGH',
    },
    status: 'success',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    actorId: '1',
    actorName: 'Admin Sistem',
    actorEmail: 'admin@nurisk.go.id',
    action: 'UPDATE_INCIDENT',
    entityType: 'incident',
    entityId: '101',
    changesSummary: 'Status diubah ke PROSES',
    beforeValue: { status: 'BARU' },
    afterValue: { status: 'PROSES' },
    status: 'success',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T09:20:00Z',
  },
  {
    id: '4',
    actorId: '3',
    actorName: 'Koordinator Relawan',
    actorEmail: 'koordinator@nurisk.go.id',
    action: 'DEPLOY_VOLUNTEER',
    entityType: 'volunteer',
    entityId: '25',
    changesSummary: 'Relawan deployed ke lokasi insiden #101',
    beforeValue: { status: 'READY' },
    afterValue: { status: 'DEPLOYED', incidentId: 101 },
    status: 'success',
    ipAddress: '192.168.1.102',
    timestamp: '2024-01-15T10:00:00Z',
  },
  {
    id: '5',
    actorId: '4',
    actorName: 'User Baru',
    actorEmail: 'newuser@test.com',
    action: 'LOGIN',
    entityType: 'user',
    entityId: '4',
    status: 'failed',
    ipAddress: '192.168.1.105',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: '6',
    actorId: '1',
    actorName: 'Admin Sistem',
    actorEmail: 'admin@nurisk.go.id',
    action: 'CREATE_BROADCAST',
    entityType: 'broadcast',
    entityId: '15',
    changesSummary: 'Broadcast peringatan banjir dikirim',
    beforeValue: null,
    afterValue: {
      title: 'Peringatan Banjir',
      message: 'Segera evacuate ke shelter terdekat',
      recipients: 5000,
    },
    status: 'success',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T11:00:00Z',
  },
  {
    id: '7',
    actorId: '2',
    actorName: 'Petugas Lapangan 1',
    actorEmail: 'petugas1@nurisk.go.id',
    action: 'CREATE_ASSESSMENT',
    entityType: 'assessment',
    entityId: '50',
    changesSummary: 'Damage assessment dibuat',
    beforeValue: null,
    afterValue: {
      buildingId: 101,
      damageLevel: 'MODERATE',
      estimatedLoss: 50000000,
    },
    status: 'success',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-15T11:30:00Z',
  },
  {
    id: '8',
    actorId: '1',
    actorName: 'Admin Sistem',
    actorEmail: 'admin@nurisk.go.id',
    action: 'SYSTEM_CONFIG_CHANGE',
    entityType: 'config',
    entityId: '1',
    changesSummary: 'Threshold alert diubah',
    beforeValue: { threshold: 50 },
    afterValue: { threshold: 75 },
    status: 'success',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T12:00:00Z',
  },
  {
    id: '9',
    actorId: '3',
    actorName: 'Koordinator Relawan',
    actorEmail: 'koordinator@nurisk.go.id',
    action: 'APPROVE_VOLUNTEER',
    entityType: 'volunteer',
    entityId: '30',
    changesSummary: 'Relawan baru disetujui',
    beforeValue: { status: 'PENDING' },
    afterValue: { status: 'ACTIVE' },
    status: 'success',
    ipAddress: '192.168.1.102',
    timestamp: '2024-01-15T13:00:00Z',
  },
  {
    id: '10',
    actorId: '1',
    actorName: 'Admin Sistem',
    actorEmail: 'admin@nurisk.go.id',
    action: 'LOGOUT',
    entityType: 'user',
    entityId: '1',
    status: 'success',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T18:00:00Z',
  },
];

/**
 * All action types
 */
export const AUDIT_ACTIONS: AuditAction[] = [
  'LOGIN',
  'LOGOUT',
  'CREATE_INCIDENT',
  'UPDATE_INCIDENT',
  'DELETE_INCIDENT',
  'CREATE_ASSESSMENT',
  'UPDATE_ASSESSMENT',
  'DEPLOY_VOLUNTEER',
  'APPROVE_VOLUNTEER',
  'CREATE_BROADCAST',
  'SYSTEM_CONFIG_CHANGE',
  'CREATE_SHELTER',
  'UPDATE_SHELTER',
  'CREATE_WAREHOUSE',
  'UPDATE_WAREHOUSE',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
];

/**
 * All entity types
 */
export const AUDIT_ENTITY_TYPES: AuditEntityType[] = [
  'incident',
  'volunteer',
  'assessment',
  'shelter',
  'warehouse',
  'user',
  'broadcast',
  'config',
  'system',
];