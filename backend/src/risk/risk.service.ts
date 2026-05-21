import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { HazardMappingService } from '../services/hazard-mapping.service';
import { VulnerabilityAnalysisService } from '../services/vulnerability-analysis.service';
import { RiskRegistryService } from '../services/risk-registry.service';

import type { RiskScore, RiskFactor, HazardZone } from '@nurisk/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RiskService {
  constructor(
    private hazardMappingService: HazardMappingService,
    private vulnerabilityAnalysisService: VulnerabilityAnalysisService,
    private riskRegistryService: RiskRegistryService,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  // ========== HAZARD ZONES ==========

  async getHazardZones(filters: { region?: string; hazard_type?: string; severity_level?: string }) {
    const zones = await this.hazardMappingService.getHazardZones(filters);

    return {
      success: true,
      data: zones,
      count: zones.length,
    };
  }

  async createHazardZone(data: {
    region: string;
    hazard_type: string;
    severity_level: string;
    recurrence_interval?: string;
    polygon_geometry?: any;
    population_exposed?: number;
    infrastructure_value?: number;
  }) {
    const zone = await this.hazardMappingService.createHazardZone(data);

    this.eventEmitter.emit('hazard.zone.created', zone);

    return {
      success: true,
      message: 'Hazard zone berhasil dibuat',
      data: zone,
    };
  }

  // ========== VULNERABILITY ==========

  async getVulnerabilityAssessments(filters: { region_id?: string; hazard_type?: string }) {
    const assessments = await this.vulnerabilityAnalysisService.getVulnerabilityAssessments(filters);

    return {
      success: true,
      data: assessments,
      count: assessments.length,
    };
  }

  async createVulnerabilityAssessment(data: {
    region_id: string;
    hazard_type: string;
    population_exposed?: number;
    infrastructure_value?: number;
    capacity_score?: number;
  }) {
    const assessment = await this.vulnerabilityAnalysisService.createVulnerabilityAssessment(data);

    this.eventEmitter.emit('vulnerability.created', assessment);

    return {
      success: true,
      message: 'Vulnerability assessment berhasil dibuat',
      data: assessment,
    };
  }

  // ========== RISK REGISTRY ==========

  async getRiskRegistry(filters: { region_id?: string; hazard_type?: string }) {
    const risks = await this.riskRegistryService.getRiskEntries(filters);

    return {
      success: true,
      data: risks,
      count: risks.length,
    };
  }

  async createRiskEntry(data: {
    region_id: string;
    hazard_type: string;
    likelihood: number;
    impact: number;
    mitigation_status?: string;
    owner?: string;
    review_date?: Date;
    notes?: string;
  }) {
    const risk = await this.riskRegistryService.createRiskEntry(data);

    this.eventEmitter.emit('risk.created', risk);

    return {
      success: true,
      message: 'Risk entry berhasil dibuat',
      data: risk,
    };
  }

  async updateRiskEntry(id: number, data: Partial<{
    likelihood: number;
    impact: number;
    mitigation_status: string;
    owner: string;
    review_date: Date;
    notes: string;
  }>) {
    const risk = await this.riskRegistryService.updateRiskEntry(id, data);

    this.eventEmitter.emit('risk.updated', risk);

    return {
      success: true,
      message: 'Risk entry berhasil diperbarui',
      data: risk,
    };
  }

  // ========== EARLY WARNINGS ==========

  async getActiveWarnings(filters: { region?: string; severity?: string }) {
    const params: any[] = [];
    let query = `SELECT * FROM early_warnings WHERE status = 'active'`;
    
    if (filters.region) {
      query += ` AND region = ${params.length + 1}`;
      params.push(filters.region);
    }
    if (filters.severity) {
      query += ` AND severity = ${params.length + 1}`;
      params.push(filters.severity);
    }
    query += ` ORDER BY issued_at DESC`;

    const warnings = (await this.prisma.$queryRawUnsafe(query, ...params)) as Array<{ id: number }>;

    return {
      success: true,
      data: warnings,
      count: warnings.length,
    };
  }

  async createWarning(data: {
    title: string;
    description?: string;
    severity: string;
    hazard_type: string;
    region: string;
    source: string;
    expires_at?: Date;
  }) {
    const warning = await this.prisma.$queryRawUnsafe(
      `INSERT INTO early_warnings (title, description, severity, hazard_type, region, source, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      data.title,
      data.description,
      data.severity,
      data.hazard_type,
      data.region,
      data.source,
      data.expires_at,
    );

    this.eventEmitter.emit('warning.created', warning);

    return {
      success: true,
      message: 'Warning berhasil dibuat',
      data: warning,
    };
  }

  async updateWarning(id: number, data: { status?: string }) {
    const warning = await this.prisma.$queryRawUnsafe(
      `UPDATE early_warnings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      data.status,
      id,
    );

    this.eventEmitter.emit('warning.updated', warning);

    return {
      success: true,
      message: 'Warning berhasil diperbarui',
      data: warning,
    };
  }
}