import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { MapsRepository } from './maps.repository';

import type { MapLayer, MapMarker, MapFilter, MapConfig, MapViewState, GeoJSONFeature } from '@nurisk/shared-types';

@Injectable()
export class MapsService {
  constructor(
    private mapsRepository: MapsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async getHistoricalDisasters(
    region?: string,
    disasterType?: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ) {
    const data = await this.mapsRepository.getHistoricalDisasters(
      region,
      disasterType,
      startDate,
      endDate,
      limit,
    );

    return {
      success: true,
      data,
      count: data.length,
    };
  }

  async getIncidentsGeoJSON(region?: string, status?: string) {
    const geojson = await this.mapsRepository.getIncidentsGeoJSON(region, status);

    return {
      success: true,
      data: geojson,
    };
  }

  async getRegionBoundary(region: string) {
    const boundary = await this.mapsRepository.getRegionBoundary(region);

    return {
      success: true,
      data: boundary,
    };
  }

  async getWmsConfig() {
    const config = await this.mapsRepository.getWmsConfig();

    return {
      success: true,
      data: config,
    };
  }
}