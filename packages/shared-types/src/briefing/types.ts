import type { BriefingStatus } from '../enums'

export interface SituationSummary {
  overview: string
  criticalIssues: string[]
  ongoingOperations: string[]
  resourceStatus: string
  weatherImpact?: string
}

export interface KeyMetrics {
  totalIncidents: number
  activeIncidents: number
  totalVolunteers: number
  deployedVolunteers: number
  totalShelters: number
  availableCapacity: number
  resourcesDeployed: number
  affectedPopulation: number
  lastUpdated: string
}

export interface ExecutiveBriefing {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  title: string
  summary?: SituationSummary
  metrics?: KeyMetrics
  recommendations: string[]
  audience?: string
  generatedAt: string
  validUntil?: string
  status: BriefingStatus
  incidentId?: string
  preparedBy?: string
}

export interface RecommendedAction {
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  type: 'resource' | 'coordination' | 'communication' | 'evacuation'
  affectedRegions: string[]
}

export interface IncidentBrief {
  id: string
  title: string
  status: string
  severity: string
  location: string
  reportedAt: string
  affectedPopulation: number
  resourcesAllocated: number
  actionTaken: string
  nextSteps: string
}
