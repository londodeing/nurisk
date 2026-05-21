import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';

import { RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private riskService: RiskService) {}

  // Hazard Zones
  @Get('hazard-zones')
  async getHazardZones(
    @Query('region') region?: string,
    @Query('hazard_type') hazardType?: string,
    @Query('severity_level') severityLevel?: string,
  ) {
    return this.riskService.getHazardZones({ region, hazard_type: hazardType, severity_level: severityLevel });
  }

  @Post('hazard-zones')
  async createHazardZone(@Body() body: any) {
    return this.riskService.createHazardZone(body);
  }

  // Vulnerability
  @Get('vulnerability')
  async getVulnerabilityAssessments(
    @Query('region_id') regionId?: string,
    @Query('hazard_type') hazardType?: string,
  ) {
    return this.riskService.getVulnerabilityAssessments({ region_id: regionId, hazard_type: hazardType });
  }

  @Post('vulnerability')
  async createVulnerabilityAssessment(@Body() body: any) {
    return this.riskService.createVulnerabilityAssessment(body);
  }

  // Risk Registry
  @Get('registry')
  async getRiskRegistry(
    @Query('region_id') regionId?: string,
    @Query('hazard_type') hazardType?: string,
  ) {
    return this.riskService.getRiskRegistry({ region_id: regionId, hazard_type: hazardType });
  }

  @Post('registry')
  async createRiskEntry(@Body() body: any) {
    return this.riskService.createRiskEntry(body);
  }

  @Patch('registry/:id')
  async updateRiskEntry(@Param('id') id: string, @Body() body: any) {
    return this.riskService.updateRiskEntry(parseInt(id, 10), body);
  }

  // Early Warnings
  @Get('warnings')
  async getActiveWarnings(
    @Query('region') region?: string,
    @Query('severity') severity?: string,
  ) {
    return this.riskService.getActiveWarnings({ region, severity });
  }

  @Post('warnings')
  async createWarning(@Body() body: any) {
    return this.riskService.createWarning(body);
  }

  @Patch('warnings/:id')
  async updateWarning(@Param('id') id: string, @Body() body: any) {
    return this.riskService.updateWarning(parseInt(id, 10), body);
  }
}