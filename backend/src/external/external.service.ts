import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import axios from 'axios';

@Injectable()
export class ExternalService {
  private readonly logger = new Logger(ExternalService.name);

  // BMKG Earthquake API
  private readonly BMKG_EARTHQUAKE_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
  
  // RainViewer API
  private readonly RAINVIEWER_URL = 'https://api.rainviewer.com/public/weather-maps.json';
  
  // InaRISK WMS
  private readonly INARISK_WMS_URL = 'https://inarisk1.bnpb.go.id:8443/geoserver/raster/wms';

  constructor(private eventEmitter: EventEmitter2) {}

  // ========== BMKG EARTHQUAKE ==========

  async getEarthquakeData() {
    try {
      const response = await axios.get(this.BMKG_EARTHQUAKE_URL, { timeout: 10000 });
      const data = response.data;

      // Filter for Central Java region
      const jatengEarthquakes = (data.Infogempa.gempa || []).filter((eq: any) => {
        const coords = eq.Coordinates?.split(',');
        if (coords && coords.length >= 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          return lat >= -7.9 && lat <= -6.5 && lng >= 108.7 && lng <= 111.5;
        }
        return false;
      });

      return {
        success: true,
        data: jatengEarthquakes,
        count: jatengEarthquakes.length,
      };
    } catch (error) {
      this.logger.error('Failed to fetch BMKG earthquake data', error);
      return {
        success: false,
        error: 'Failed to fetch earthquake data',
      };
    }
  }

  // ========== RAINVIEWER RADAR ==========

  async getRainRadarData() {
    try {
      const response = await axios.get(this.RAINVIEWER_URL, { timeout: 10000 });
      const data = response.data;

      return {
        success: true,
        data: {
          radar: data.radar,
          satellite: data.satellite,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch RainViewer data', error);
      return {
        success: false,
        error: 'Failed to fetch radar data',
      };
    }
  }

  // ========== INARISK WMS CONFIG ==========

  getInaRiskWmsConfig() {
    return {
      success: true,
      data: {
        url: this.INARISK_WMS_URL,
        layers: [
          { name: 'Batas Desa', id: 'raster:batas_desa' },
          { name: 'Banjir', id: 'raster:banjir' },
          { name: 'Tanah Longsor', id: 'raster:tanah_longsor' },
          { name: 'Gempa', id: 'raster:gempa' },
          { name: 'Tsunami', id: 'raster:tsunami' },
          { name: 'Kekeringan', id: 'raster:kekeringan' },
        ],
      },
    };
  }

  // ========== VOLCANO STATUS ==========

  async getVolcanoStatus() {
    try {
      const eqData = await this.getEarthquakeData();
      
      // Map volcano codes to their current status
      const volcanoStatus = {
        'MERAPI': { name: 'Merapi', status: 'WASPADA', lastUpdate: new Date() },
        'SEMERU': { name: 'Semeru', status: 'WASPADA', lastUpdate: new Date() },
        'SLAMET': { name: 'Slamet', status: 'NORMAL', lastUpdate: new Date() },
        'DIENG': { name: 'Dieng', status: 'NORMAL', lastUpdate: new Date() },
      };

      return {
        success: true,
        data: volcanoStatus,
      };
    } catch (error) {
      this.logger.error('Failed to get volcano status', error);
      return {
        success: false,
        error: 'Failed to get volcano status',
      };
    }
  }

  // ========== NEWS SCRAPING ==========

  async getLatestNews() {
    // This would typically scrape from news sites
    // For now, return placeholder
    return {
      success: true,
      data: [],
      message: 'News scraping not implemented in NestJS yet',
    };
  }
}