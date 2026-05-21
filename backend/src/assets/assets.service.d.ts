import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';
import { AssetFilter, AssetsRepository } from './assets.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
export declare const createAssetSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    warehouse_id: z.ZodOptional<z.ZodString>;
    qr_code: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        available: "available";
        in_use: "in_use";
        maintenance: "maintenance";
        retired: "retired";
    }>>;
}, z.core.$strip>;
export declare const createTransactionSchema: z.ZodObject<{
    asset_id: z.ZodString;
    incident_id: z.ZodOptional<z.ZodString>;
    volunteer_id: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    type: z.ZodEnum<{
        in: "in";
        out: "out";
        transfer: "transfer";
        adjustment: "adjustment";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        pending: "pending";
        rejected: "rejected";
    }>>;
}, z.core.$strip>;
export declare const updateAssetSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    quantity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    unit: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    warehouse_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    qr_code: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        available: "available";
        in_use: "in_use";
        maintenance: "maintenance";
        retired: "retired";
    }>>>;
}, z.core.$strip>;
export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export declare class AssetsService {
    private assetsRepository;
    private eventEmitter;
    constructor(assetsRepository: AssetsRepository, eventEmitter: EventEmitter2);
    private mapAssetToDto;
    private mapDtoToRepository;
    create(dto: CreateAssetDTO): Promise<any>;
    findById(id: string): Promise<any>;
    findByQrCode(qrCode: string): Promise<any>;
    findAll(filters: AssetFilter | undefined, options: PaginationRequest): Promise<ListResponse<any>>;
    update(id: string, dto: UpdateAssetDTO): Promise<any>;
    delete(id: string): Promise<any>;
    createTransaction(dto: CreateTransactionDTO): Promise<any>;
    getTransactions(assetId: string): Promise<any>;
}
//# sourceMappingURL=assets.service.d.ts.map