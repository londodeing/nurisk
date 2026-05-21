import { Controller, Get, Param, Query } from '@nestjs/common';

import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private mapsService: MapsService) {}

  @Get('historical')
  async getHistoricalDisasters(
    @Query('region') region?: string,
    @Query('disaster_type') disasterType?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.mapsService.getHistoricalDisasters(region, disasterType, startDate, endDate, limitNum);
  }

  @Get('geojson')
  async getIncidentsGeoJSON(
    @Query('region') region?: string,
    @Query('status') status?: string,
  ) {
    return this.mapsService.getIncidentsGeoJSON(region, status);
  }

  @Get('boundary/:region')
  async getRegionBoundary(@Param('region') region: string) {
    return this.mapsService.getRegionBoundary(region);
  }

  @Get('wms-config')
  async getWmsConfig() {
    return this.mapsService.getWmsConfig();
  }
}