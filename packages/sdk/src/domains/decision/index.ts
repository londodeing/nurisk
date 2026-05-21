import { client } from '../../core/client'
import type { Decision, DecisionStats, DecisionOption } from '@nurisk/shared-types/decision'
import type { DecisionImpact, DecisionUrgency, DecisionStatus } from '@nurisk/shared-types/enums'

export interface DecisionCreatePayload {
  title: string
  description: string
  category: string
  impact: DecisionImpact
  urgency: DecisionUrgency
  alternatives?: DecisionOption[]
  inputFactors?: Record<string, number>
  riskLevel?: DecisionImpact
  requestedBy: string
  incidentId?: string
}

export const decisionApi = {
  execute: (payload: DecisionCreatePayload): Promise<Decision> =>
    client.post<Decision>('/decision/execute', payload).then((r) => r.data!),

  getStatus: (id: string): Promise<Decision> =>
    client.get<Decision>(`/decision/${id}`).then((r) => r.data!),

  approve: (
    id: string,
    selectedOption: string,
    rationale: string
  ): Promise<Decision> =>
    client
      .post<Decision>(`/decision/${id}/approve`, { selectedOption, rationale })
      .then((r) => r.data!),

  reject: (id: string, rationale: string): Promise<Decision> =>
    client
      .post<Decision>(`/decision/${id}/reject`, { rationale })
      .then((r) => r.data!),

  defer: (id: string, reason: string): Promise<Decision> =>
    client
      .post<Decision>(`/decision/${id}/defer`, { reason })
      .then((r) => r.data!),

  list: (params?: {
    status?: DecisionStatus
    category?: string
  }): Promise<Decision[]> =>
    client.get<Decision[]>('/decision', { params }).then((r) => r.data!),

  getStats: (): Promise<DecisionStats> =>
    client.get<DecisionStats>('/decision/stats').then((r) => r.data!),
}
