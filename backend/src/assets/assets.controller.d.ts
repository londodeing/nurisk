import { CreateAssetDTO, CreateTransactionDTO, UpdateAssetDTO, AssetsService } from './assets.service';
export declare class AssetsController {
    private assetsService;
    constructor(assetsService: AssetsService);
    create(dto: CreateAssetDTO): Promise<any>;
    findAll(page?: string, limit?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC', category?: string, status?: string, region?: string, search?: string): Promise<import("@nurisk/shared-types/api").ListResponse<any>>;
    findById(id: string): Promise<any>;
    findByQrCode(qrCode: string): Promise<any>;
    update(id: string, dto: UpdateAssetDTO): Promise<any>;
    delete(id: string): Promise<any>;
    createTransaction(dto: CreateTransactionDTO): Promise<any>;
    getTransactions(id: string): Promise<any>;
}
//# sourceMappingURL=assets.controller.d.ts.map