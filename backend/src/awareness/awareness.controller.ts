import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { AwarenessService } from './awareness.service';

@Controller('awareness')
export class AwarenessController {
  constructor(private readonly service: AwarenessService) {}

  @Post('routes')
  async createRoute(@Body() body: any) {
    return this.service.createRoute(body);
  }

  @Get('routes')
  async listRoutes(@Query() query: any) {
    return this.service.listRoutes(query);
  }

  @Get('routes/:id')
  async getRouteById(@Param('id') id: string) {
    return this.service.getRouteById(id);
  }

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

  @Get('tactical/:incidentId')
  async getTactical(@Param('incidentId') incidentId: string) {
    return this.service.getTactical(incidentId);
  }
}
