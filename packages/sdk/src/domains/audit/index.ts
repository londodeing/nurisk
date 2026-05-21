// Audit Domain - Governance
import { client } from '../../core/client'
import type { AuditLogEntry, AuditFilters } from '@nurisk/shared-types/audit'

export const auditApi = {
  log: (entry: {
    action: AuditLogEntry['action']
    entityType: string
    entityId: string
    changes?: Record<string, { from: unknown; to: unknown }>
    metadata?: Record<string, unknown>
  }): Promise<AuditLogEntry> =>
    client.post<AuditLogEntry>('/api/v1/audit', entry).then((res) => res.data!),

  query: (filters: AuditFilters): Promise<AuditLogEntry[]> =>
    client.get<AuditLogEntry[]>('/api/v1/audit', { params: filters }).then(
      (res) => res.data!
    ),

  getById: (id: string): Promise<AuditLogEntry> =>
    client.get<AuditLogEntry>(`/api/v1/audit/${id}`).then((res) => res.data!),

  export: (filters: AuditFilters, format: 'json' | 'csv'): Promise<string> =>
    client
      .get<string>(`/api/v1/audit/export`, {
        params: { ...filters, format },
      })
      .then((res) => res.data!),

  getByEntity: (
    entityType: string,
    entityId: string
  ): Promise<AuditLogEntry[]> =>
    client
      .get<AuditLogEntry[]>(`/api/v1/audit/entity/${entityType}/${entityId}`)
      .then((res) => res.data!),

  getByActor: (actorId: string): Promise<AuditLogEntry[]> =>
    client
      .get<AuditLogEntry[]>(`/api/v1/audit/actor/${actorId}`)
      .then((res) => res.data!),
}