import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { z } from 'zod';

import { BuildingFilter, BuildingsRepository } from './buildings.repository';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';

// Zod Schemas
export const createBuildingSchema = z.object({
  name: z.string().min(1, 'Nama bangunan wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  region: z.string().min(1, 'Region wajib diisi'),
  district: z.string().optional(),
  village: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imb: z.boolean().optional(),
  slf: z.boolean().optional(),
  struktur: z.enum(['beton_bertulang', 'baja', 'kayu', 'tidak_tahu']).optional(),
  non_struktural: z.enum(['tidak_ada', 'keramik', 'langit_langit']).optional(),
  odnk: z.boolean().optional(),
  ibu_hamil: z.boolean().optional(),
  lansia: z.boolean().optional(),
  balita: z.boolean().optional(),
  fasilitas: z.array(z.string()).optional(),
  peralatan: z.array(z.string()).optional(),
  dana_darurat: z.enum(['ada', 'tidak_ada', 'tidak_tahu']).optional(),
  anggaran: z.enum(['ada', 'tidak_ada', 'tidak_tahu']).optional(),
  asuransi: z.enum(['ada', 'tidak_ada', 'tidak_tahu']).optional(),
});

export const updateBuildingSchema = createBuildingSchema.partial();

export type CreateBuildingDTO = z.infer<typeof createBuildingSchema>;
export type UpdateBuildingDTO = z.infer<typeof updateBuildingSchema>;

export class BuildingsService {
  constructor(
    private buildingsRepository: BuildingsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateBuildingDTO, userId?: number): Promise<any> {
    const parsed = createBuildingSchema.parse(dto);

    const building = await this.buildingsRepository.create({
      ...parsed,
      user_id: userId,
    });

    this.eventEmitter.emit('building.created', building);

    return {
      success: true,
      message: 'Assessment bangunan berhasil dibuat',
      data: building,
    };
  }

  async findById(id: number): Promise<any> {
    const building = await this.buildingsRepository.findById(id);

    if (!building) {
      throw new NotFoundException('Bangunan tidak ditemukan');
    }

    return {
      success: true,
      data: building,
    };
  }

  async findAll(
    filters: BuildingFilter = {},
    options: PaginationRequest,
  ): Promise<ListResponse<any>> {
    const result = await this.buildingsRepository.findAll(filters, options);

    return result;
  }

  async update(id: number, dto: UpdateBuildingDTO): Promise<any> {
    const parsed = updateBuildingSchema.parse(dto);

    const building = await this.buildingsRepository.update(id, parsed);

    if (!building) {
      throw new NotFoundException('Bangunan tidak ditemukan');
    }

    this.eventEmitter.emit('building.updated', building);

    return {
      success: true,
      message: 'Assessment bangunan berhasil diperbarui',
      data: building,
    };
  }

  async delete(id: number): Promise<any> {
    await this.buildingsRepository.delete(id);

    this.eventEmitter.emit('building.deleted', { id });

    return {
      success: true,
      message: 'Assessment bangunan berhasil dihapus',
    };
  }

  async findByRegion(region: string): Promise<any> {
    const buildings = await this.buildingsRepository.findByRegion(region);

    return {
      success: true,
      data: buildings,
      count: buildings.length,
    };
  }
}