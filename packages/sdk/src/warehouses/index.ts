// Warehouses SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  AssignWarehousePICRequest,
  AssignWarehouseCrewRequest,
  CreateStockRequest,
  MovementRequest,
  WarehouseStock,
  WarehouseMovement,
  WarehouseCrew,
} from '@nurisk/shared-types/warehouse'

import type { ListResponse, PaginationRequest } from '@nurisk/shared-types'

export class WarehousesApi {
  constructor(private client: SdkClient) {}

  async list(filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<Warehouse>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Warehouse>>('/warehouses', { params })
    return res.data!
  }

  async getById(id: string): Promise<Warehouse> {
    const res = await this.client.get<Warehouse>(`/warehouses/${id}`)
    return res.data!
  }

  async create(data: CreateWarehouseRequest): Promise<Warehouse> {
    const res = await this.client.post<Warehouse>('/warehouses', data)
    return res.data!
  }

  async update(id: string, data: UpdateWarehouseRequest): Promise<Warehouse> {
    const res = await this.client.patch<Warehouse>(`/warehouses/${id}`, data)
    return res.data!
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/warehouses/${id}`)
  }

  // Stock
  async getStock(id: string): Promise<WarehouseStock[]> {
    const res = await this.client.get<WarehouseStock[]>(`/warehouses/${id}/stock`)
    return res.data!
  }

  async addStock(data: CreateStockRequest): Promise<WarehouseStock> {
    const res = await this.client.post<WarehouseStock>('/warehouses/stock', data)
    return res.data!
  }

  async updateStock(stockId: string, data: Partial<CreateStockRequest>): Promise<WarehouseStock> {
    const res = await this.client.patch<WarehouseStock>(`/warehouses/stock/${stockId}`, data)
    return res.data!
  }

  // Movements
  async createMovement(data: MovementRequest): Promise<WarehouseMovement> {
    const res = await this.client.post<WarehouseMovement>('/warehouses/movements', data)
    return res.data!
  }

  async getMovements(warehouseId: string, filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<WarehouseMovement>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<WarehouseMovement>>(`/warehouses/${warehouseId}/movements`, { params })
    return res.data!
  }

  // Crew
  async assignPIC(data: AssignWarehousePICRequest): Promise<void> {
    await this.client.post('/warehouses/assign-pic', data)
  }

  async assignCrew(data: AssignWarehouseCrewRequest): Promise<WarehouseCrew> {
    const res = await this.client.post<WarehouseCrew>('/warehouses/assign-crew', data)
    return res.data!
  }

  async removeCrew(warehouseId: string, volunteerId: string): Promise<void> {
    await this.client.delete(`/warehouses/${warehouseId}/crew/${volunteerId}`)
  }

  async getCrew(id: string): Promise<WarehouseCrew[]> {
    const res = await this.client.get<WarehouseCrew[]>(`/warehouses/${id}/crew`)
    return res.data!
  }
}