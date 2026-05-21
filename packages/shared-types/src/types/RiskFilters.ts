export type RiskLikelihood = 1 | 2 | 3 | 4 | 5
export type RiskImpact = 1 | 2 | 3 | 4 | 5
export type RiskStatus = 'identified' | 'mitigating' | 'monitoring' | 'closed'
export type RiskCategory = 'operational' | 'financial' | 'reputational' | 'compliance' | 'technical'

export interface RiskFilters {
  status?: RiskStatus
  category?: RiskCategory
  minLikelihood?: RiskLikelihood
  minImpact?: RiskImpact
}
