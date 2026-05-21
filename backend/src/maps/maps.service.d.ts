import { EventEmitter2 } from 'eventemitter2';
import { MapsRepository } from './maps.repository';
export declare class MapsService {
    private mapsRepository;
    private eventEmitter;
    constructor(mapsRepository: MapsRepository, eventEmitter: EventEmitter2);
    getHistoricalDisasters(region?: string, disasterType?: string, startDate?: string, endDate?: string, limit?: number): Promise<{
        success: boolean;
        data: {
            region: string | null;
            id: string;
            createdAt: Date;
            disasterType: import("@prisma/client").$Enums.DisasterType | null;
            eventDate: Date | null;
            source: string | null;
            time: string | null;
        }[];
        count: number;
    }>;
    getIncidentsGeoJSON(region?: string, status?: string): Promise<{
        success: boolean;
        data: {
            type: string;
            features: {
                type: string;
                geometry: {
                    type: string;
                    coordinates: number[];
                };
                properties: {
                    id: string;
                    title: string | null;
                    disaster_type: import("@prisma/client").$Enums.DisasterType | null;
                    status: import("@prisma/client").$Enums.IncidentStatus;
                    priority_level: string | null;
                    region: string | null;
                    created_at: Date;
                };
            }[];
        };
    }>;
    getRegionBoundary(region: string): Promise<{
        success: boolean;
        data: {
            region: string | null;
        } | null;
    }>;
    getWmsConfig(): Promise<{
        success: boolean;
        data: {
            layers: {
                name: string;
                url: string;
                layers: string;
            }[];
        };
    }>;
}
//# sourceMappingURL=maps.service.d.ts.map