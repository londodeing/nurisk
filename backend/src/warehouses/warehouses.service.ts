import { Injectable } from '@nestjs/common';

import { Warehouse, WarehousesRepository } from './warehouses.repository';
import { WarehouseFilter } from '@nurisk/shared-types/warehouse';

import type { WarehouseStock, WarehouseMovement, WarehouseCrew, WarehouseEquipment } from '@nurisk/shared-types';

@Injectable()
export class WarehousesService {
  constructor(private warehousesRepository: WarehousesRepository) {}

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    if (!data.name) {
      throw new Error('Name is required');
    }
    return this.warehousesRepository.create(data);
  }

  async findAll(filters: WarehouseFilter): Promise<Warehouse[]> {
    return this.warehousesRepository.findAll(filters);
  }

  async findById(id: number): Promise<Warehouse | null> {
    return this.warehousesRepository.findById(id);
  }

  async update(id: number, data: Partial<Warehouse>): Promise<Warehouse | null> {
    return this.warehousesRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.warehousesRepository.delete(id);
  }
}