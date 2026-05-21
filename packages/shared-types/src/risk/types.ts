import type { RiskLikelihood, RiskImpact, RiskStatus, RiskCategory, RiskFilters } from '../types/RiskFilters'

export type { RiskLikelihood, RiskImpact, RiskStatus, RiskCategory, RiskFilters }

export interface Risk {
  id: string;
  name: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
  owner?: string;
  status: RiskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RiskMatrixCell {
  likelihood: number;
  impact: number;
  count: number;
  risks: Risk[];
}

export interface RiskSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCategory: Record<string, number>;
  byStatus?: Record<string, number>;
  highRisk?: number;
  mediumRisk?: number;
  lowRisk?: number;
}
