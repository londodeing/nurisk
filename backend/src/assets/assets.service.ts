import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

import { AssetFilter, AssetsRepository } from './assets.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Nama aset wajib diisi'),
  category: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
  warehouse_id: z.string().optional(),
  qr_code: z.string().optional(),
  status: z.enum(['available', 'in_use', 'maintenance', 'retired']).optional(),
});

export const createTransactionSchema = z.object({
  asset_id: z.string().min(1, 'ID aset wajib diisi'),
  incident_id: z.string().optional(),
  volunteer_id: z.string().optional(),
  quantity: z.number().min(1).optional(),
  type: z.enum(['in', 'out', 'transfer', 'adjustment']),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;

export class AssetsService {
  constructor(
    private assetsRepository: AssetsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  private mapAssetToDto(asset: any): any {
    return {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      unit: asset.unit,
      location: asset.region,
      warehouseId: asset.warehouseId,
      qrCode: asset.qrCode,
      status: asset.status,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  private mapDtoToRepository(dto: any): any {
    const mapped: any = {};
    if (dto.name !== undefined) mapped.name = dto.name;
    if (dto.category !== undefined) mapped.category = dto.category;
    if (dto.quantity !== undefined) mapped.quantity = dto.quantity;
    if (dto.unit !== undefined) mapped.unit = dto.unit;
    if (dto.location !== undefined) mapped.location = dto.location;
    if (dto.warehouse_id !== undefined) mapped.warehouseId = dto.warehouse_id;
    if (dto.qr_code !== undefined) mapped.qrCode = dto.qr_code;
    if (dto.status !== undefined) mapped.status = dto.status;
    return mapped;
  }

  async create(dto: CreateAssetDTO): Promise<any> {
    const parsed = createAssetSchema.parse(dto);
    const repoData = this.mapDtoToRepository(parsed);

    const asset = await this.assetsRepository.create(repoData);

    this.eventEmitter.emit('asset.created', asset);

    return {
      success: true,
      message: 'Aset berhasil ditambahkan',
      data: this.mapAssetToDto(asset),
    };
  }

  async findById(id: string): Promise<any> {
    const asset = await this.assetsRepository.findById(id);

    if (!asset) {
      throw new NotFoundException('Aset tidak ditemukan');
    }

    return {
      success: true,
      data: this.mapAssetToDto(asset),
    };
  }

  async findByQrCode(qrCode: string): Promise<any> {
    const asset = await this.assetsRepository.findByQrCode(qrCode);

    if (!asset) {
      throw new NotFoundException('Aset tidak ditemukan');
    }

    return {
      success: true,
      data: this.mapAssetToDto(asset),
    };
  }

  async findAll(
    filters: AssetFilter = {},
    options: PaginationRequest,
  ): Promise<ListResponse<any>> {
    const result = await this.assetsRepository.findAll(filters, options);

    return result;
  }

  async update(id: string, dto: UpdateAssetDTO): Promise<any> {
    const parsed = updateAssetSchema.parse(dto);
    const repoData = this.mapDtoToRepository(parsed);

    const asset = await this.assetsRepository.update(id, repoData);

    if (!asset) {
      throw new NotFoundException('Aset tidak ditemukan');
    }

    this.eventEmitter.emit('asset.updated', asset);

    return {
      success: true,
      message: 'Aset berhasil diperbarui',
      data: this.mapAssetToDto(asset),
    };
  }

  async delete(id: string): Promise<any> {
    await this.assetsRepository.delete(id);

    this.eventEmitter.emit('asset.deleted', { id });

    return {
      success: true,
      message: 'Aset berhasil dihapus',
    };
  }

  async createTransaction(dto: CreateTransactionDTO): Promise<any> {
    const parsed = createTransactionSchema.parse(dto);
    const repoData = {
      assetId: parsed.asset_id,
      incidentId: parsed.incident_id,
      volunteerId: parsed.volunteer_id,
      quantity: parsed.quantity ?? 1,
      type: parsed.type,
      status: parsed.status,
    };

    const transaction = await this.assetsRepository.createTransaction(repoData);

    this.eventEmitter.emit('asset.transaction.created', transaction);

    return {
      success: true,
      message: 'Transaksi aset berhasil dicatat',
      data: transaction,
    };
  }

  async getTransactions(assetId: string): Promise<any> {
    const transactions = await this.assetsRepository.getTransactions(assetId);

    return {
      success: true,
      data: transactions,
    };
  }
}