import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { BuildingFilter, BuildingsRepository } from './buildings.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
export declare const createBuildingSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    region: z.ZodString;
    district: z.ZodOptional<z.ZodString>;
    village: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    imb: z.ZodOptional<z.ZodBoolean>;
    slf: z.ZodOptional<z.ZodBoolean>;
    struktur: z.ZodOptional<z.ZodEnum<{
        beton_bertulang: "beton_bertulang";
        baja: "baja";
        kayu: "kayu";
        tidak_tahu: "tidak_tahu";
    }>>;
    non_struktural: z.ZodOptional<z.ZodEnum<{
        tidak_ada: "tidak_ada";
        keramik: "keramik";
        langit_langit: "langit_langit";
    }>>;
    odnk: z.ZodOptional<z.ZodBoolean>;
    ibu_hamil: z.ZodOptional<z.ZodBoolean>;
    lansia: z.ZodOptional<z.ZodBoolean>;
    balita: z.ZodOptional<z.ZodBoolean>;
    fasilitas: z.ZodOptional<z.ZodArray<z.ZodString>>;
    peralatan: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dana_darurat: z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>;
    anggaran: z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>;
    asuransi: z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>;
}, z.core.$strip>;
export declare const updateBuildingSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    village: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    imb: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    slf: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    struktur: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        beton_bertulang: "beton_bertulang";
        baja: "baja";
        kayu: "kayu";
        tidak_tahu: "tidak_tahu";
    }>>>;
    non_struktural: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        tidak_ada: "tidak_ada";
        keramik: "keramik";
        langit_langit: "langit_langit";
    }>>>;
    odnk: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    ibu_hamil: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    lansia: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    balita: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    fasilitas: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    peralatan: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    dana_darurat: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>>;
    anggaran: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>>;
    asuransi: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        tidak_tahu: "tidak_tahu";
        tidak_ada: "tidak_ada";
        ada: "ada";
    }>>>;
}, z.core.$strip>;
export type CreateBuildingDTO = z.infer<typeof createBuildingSchema>;
export type UpdateBuildingDTO = z.infer<typeof updateBuildingSchema>;
export declare class BuildingsService {
    private buildingsRepository;
    private eventEmitter;
    constructor(buildingsRepository: BuildingsRepository, eventEmitter: EventEmitter2);
    create(dto: CreateBuildingDTO, userId?: number): Promise<any>;
    findById(id: number): Promise<any>;
    findAll(filters: BuildingFilter | undefined, options: PaginationRequest): Promise<ListResponse<any>>;
    update(id: number, dto: UpdateBuildingDTO): Promise<any>;
    delete(id: number): Promise<any>;
    findByRegion(region: string): Promise<any>;
}
//# sourceMappingURL=buildings.service.d.ts.map