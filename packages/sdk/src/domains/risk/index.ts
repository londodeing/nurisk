// Risk Domain - Risk/Event (EVENT-DRIVEN)
import { client } from '../../core/client'
import type { Risk, RiskSummary, RiskMatrixCell } from '@nurisk/shared-types/risk'
import type { RiskFilters, RiskStatus } from '@nurisk/shared-types/types'

export const riskApi = {
  assess: (input: {
    name: string
    description: string
    category: string
    likelihood: number
    impact: number
    mitigation?: string
  }): Promise<Risk> =>
    client.post<Risk>('/api/v1/risk/assess', input).then((res) => res.data!),

  list: (params?: RiskFilters): Promise<Risk[]> =>
    client.get<Risk[]>('/api/v1/risk', { params }).then((res) => res.data!),

  getById: (id: string): Promise<Risk> =>
    client.get<Risk>(`/api/v1/risk/${id}`).then((res) => res.data!),

  update: (id: string, data: Partial<Risk>): Promise<Risk> =>
    client.patch<Risk>(`/api/v1/risk/${id}`, data).then((res) => res.data!),

  updateStatus: (
    id: string,
    status: RiskStatus
  ): Promise<Risk> =>
    client
      .patch<Risk>(`/api/v1/risk/${id}`, { status })
      .then((res) => res.data!),

  delete: (id: string): Promise<void> =>
    client.delete<void>(`/api/v1/risk/${id}`).then((res) => res.data!),

  getSummary: (): Promise<RiskSummary> =>
    client.get<RiskSummary>('/api/v1/risk/summary').then((res) => res.data!),

  getMatrix: (): Promise<RiskMatrixCell[]> =>
    client.get<RiskMatrixCell[]>('/api/v1/risk/matrix').then((res) => res.data!),
}