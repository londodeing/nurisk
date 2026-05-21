import { CreateBuildingDTO, UpdateBuildingDTO, BuildingsService } from './buildings.service';
export declare class BuildingsController {
    private buildingsService;
    constructor(buildingsService: BuildingsService);
    create(dto: CreateBuildingDTO): Promise<any>;
    findAll(page?: string, limit?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', region?: string, struktur?: string, search?: string): Promise<import("@nurisk/shared-types/api").ListResponse<any>>;
    findById(id: number): Promise<any>;
    update(id: number, dto: UpdateBuildingDTO): Promise<any>;
    delete(id: number): Promise<any>;
    findByRegion(region: string): Promise<any>;
}
//# sourceMappingURL=buildings.controller.d.ts.map