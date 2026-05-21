export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'READ'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'CREATE_INCIDENT'
  | 'UPDATE_INCIDENT'
  | 'DELETE_INCIDENT'
  | 'CREATE_ASSESSMENT'
  | 'UPDATE_ASSESSMENT'
  | 'DEPLOY_VOLUNTEER'
  | 'APPROVE_VOLUNTEER'
  | 'CREATE_BROADCAST'
  | 'SYSTEM_CONFIG_CHANGE'
  | 'CREATE_SHELTER'
  | 'UPDATE_SHELTER'
  | 'CREATE_WAREHOUSE'
  | 'UPDATE_WAREHOUSE'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER';

export type AuditStatus = 'success' | 'failed' | 'partial';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  status?: AuditStatus;
  changes?: Record<string, { from: unknown; to: unknown }>;
  changesSummary?: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditFilters {
  action?: AuditAction;
  entityType?: string;
  actorId?: string;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}
