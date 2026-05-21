import { client } from '../../core/client'
import type { Warning, WarningFilter } from '@nurisk/shared-types/early-warning'

export const earlyWarningApi = {
  issue: (data: {
    title: string
    description: string
    severity: Warning['severity']
    status: Warning['status']
    affectedAreas: string[]
    issuedAt: string
    expiresAt: string
    source?: string
    incidentId?: string
    regionId?: string
    createdBy?: string
  }): Promise<Warning> =>
    client.post<Warning>('/early-warning', data).then((r) => r.data!),

  getActive: (params?: WarningFilter): Promise<Warning[]> =>
    client.get<Warning[]>('/early-warning/active', { params }).then((r) => r.data!),

  getById: (id: string): Promise<Warning> =>
    client.get<Warning>(`/early-warning/${id}`).then((r) => r.data!),

  update: (id: string, data: Partial<Warning>): Promise<Warning> =>
    client.patch<Warning>(`/early-warning/${id}`, data).then((r) => r.data!),

  expire: (id: string): Promise<Warning> =>
    client.post<Warning>(`/early-warning/${id}/expire`, {}).then((r) => r.data!),

  list: (params?: WarningFilter): Promise<Warning[]> =>
    client.get<Warning[]>('/early-warning', { params }).then((r) => r.data!),
}
