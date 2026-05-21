import { Controller, Get, Query } from '@nestjs/common';

import { ExternalService } from './external.service';

@Controller('external')
export class ExternalController {
  constructor(private externalService: ExternalService) {}

  @Get('earthquake')
  async getEarthquakeData() {
    return this.externalService.getEarthquakeData();
  }

  @Get('rain-radar')
  async getRainRadarData() {
    return this.externalService.getRainRadarData();
  }

  @Get('inarisk-wms')
  async getInaRiskWmsConfig() {
    return this.externalService.getInaRiskWmsConfig();
  }

  @Get('volcano-status')
  async getVolcanoStatus() {
    return this.externalService.getVolcanoStatus();
  }

  @Get('news')
  async getLatestNews() {
    return this.externalService.getLatestNews();
  }
}