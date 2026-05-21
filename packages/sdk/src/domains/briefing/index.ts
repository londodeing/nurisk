import { client } from '../../core/client'
import type { ExecutiveBriefing, KeyMetrics } from '@nurisk/shared-types/briefing'

export const briefingApi = {
  generate: (incidentId?: string): Promise<ExecutiveBriefing> =>
    client
      .post<ExecutiveBriefing>('/briefing/generate', { incidentId })
      .then((r) => r.data!),

  getLatest: (): Promise<ExecutiveBriefing> =>
    client.get<ExecutiveBriefing>('/briefing/latest').then((r) => r.data!),

  getById: (id: string): Promise<ExecutiveBriefing> =>
    client.get<ExecutiveBriefing>(`/briefing/${id}`).then((r) => r.data!),

  getMetrics: (): Promise<KeyMetrics> =>
    client.get<KeyMetrics>('/briefing/metrics').then((r) => r.data!),

  list: (params?: { incidentId?: string; limit?: number }): Promise<ExecutiveBriefing[]> =>
    client
      .get<ExecutiveBriefing[]>('/briefing', { params })
      .then((r) => r.data!),
}
