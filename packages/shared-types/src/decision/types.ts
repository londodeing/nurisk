import type { DecisionImpact, DecisionUrgency, DecisionStatus } from '../enums'

export interface DecisionOption {
  id: string
  label: string
  description: string
  pros: string[]
  cons: string[]
  estimatedCost?: number
  estimatedTime?: string
}

export interface Decision {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  title: string
  description: string
  category: string
  impact: DecisionImpact
  urgency: DecisionUrgency
  status: DecisionStatus
  reasoning?: string
  alternatives?: DecisionOption[]
  inputFactors?: Record<string, number>
  riskLevel?: DecisionImpact
  selectedOption?: string
  rationale?: string
  requestedBy: string
  decidedBy?: string
  decidedAt?: string
  incidentId?: string
}

export interface DecisionStats {
  total: number
  pending: number
  approved: number
  rejected: number
  deferred: number
  avgDecisionTime: number
  byCategory: Record<string, number>
}

export interface DecisionConfig {
  autoApproveThreshold?: DecisionImpact
  requireApprovalFor: string[]
  escalationTimeout: number
}
