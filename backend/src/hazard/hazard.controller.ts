import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { HazardService } from './hazard.service';

@Controller('hazard')
export class HazardController {
  constructor(private readonly service: HazardService) {}

  @Post('zones')
  async createZone(@Body() body: any) {
    return this.service.createZone(body);
  }

  @Get('zones')
  async listZones(@Query() query: any) {
    return this.service.listZones(query);
  }

  @Get('zones/:id')
  async getZoneById(@Param('id') id: string) {
    return this.service.getZoneById(id);
  }

  @Patch('zones/:id')
  async updateZone(@Param('id') id: string, @Body() body: any) {
    return this.service.updateZone(id, body);
  }

  @Delete('zones/:id')
  async deleteZone(@Param('id') id: string) {
    return this.service.deleteZone(id);
  }

  @Post('vulnerability')
  async createVulnerability(@Body() body: any) {
    return this.service.createVulnerability(body);
  }

  @Get('vulnerability')
  async listVulnerability(@Query() query: any) {
    return this.service.listVulnerability(query);
  }

  @Get('vulnerability/:regionId/:hazardZoneId')
  async getVulnerabilityByRegion(
    @Param('regionId') regionId: string,
    @Param('hazardZoneId') hazardZoneId: string,
  ) {
    return this.service.getVulnerabilityByRegion(regionId, hazardZoneId);
  }

  @Get('heatmap')
  async getHeatmap() {
    return this.service.getHeatmap();
  }
}
