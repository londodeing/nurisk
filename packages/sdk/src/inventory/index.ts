// Inventory SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  InventoryItem,
  SupplyRequest,
  Distribution,
  InventoryFilter,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

export class InventoryApi {
  constructor(private client: SdkClient) {}

  // Items
  async listItems(filter?: InventoryFilter & PaginationRequest): Promise<ListResponse<InventoryItem>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<InventoryItem>>('/inventory/items', { params })
    return res.data!
  }

  async getItemById(id: string): Promise<InventoryItem> {
    const res = await this.client.get<InventoryItem>(`/inventory/items/${id}`)
    return res.data!
  }

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await this.client.post<InventoryItem>('/inventory/items', data)
    return res.data!
  }

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await this.client.patch<InventoryItem>(`/inventory/items/${id}`, data)
    return res.data!
  }

  async deleteItem(id: string): Promise<void> {
    await this.client.delete(`/inventory/items/${id}`)
  }

  // Supply Requests
  async listRequests(filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<SupplyRequest>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<SupplyRequest>>('/inventory/requests', { params })
    return res.data!
  }

  async getRequestById(id: string): Promise<SupplyRequest> {
    const res = await this.client.get<SupplyRequest>(`/inventory/requests/${id}`)
    return res.data!
  }

  async createRequest(data: { incidentId: string; items: { itemId: string; quantity: number }[]; notes?: string }): Promise<SupplyRequest> {
    const res = await this.client.post<SupplyRequest>('/inventory/requests', data)
    return res.data!
  }

  async approveRequest(id: string, approvedBy: string): Promise<SupplyRequest> {
    const res = await this.client.post<SupplyRequest>(`/inventory/requests/${id}/approve`, { approvedBy })
    return res.data!
  }

  async rejectRequest(id: string, rejectedBy: string, reason: string): Promise<void> {
    await this.client.post(`/inventory/requests/${id}/reject`, { rejectedBy, reason })
  }

  // Distributions
  async listDistributions(filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<Distribution>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Distribution>>('/inventory/distributions', { params })
    return res.data!
  }

  async createDistribution(data: { supplyRequestId: string; shelterId?: string; items: { itemId: string; quantity: number }[]; notes?: string }): Promise<Distribution> {
    const res = await this.client.post<Distribution>('/inventory/distributions', data)
    return res.data!
  }

  async getDistributionById(id: string): Promise<Distribution> {
    const res = await this.client.get<Distribution>(`/inventory/distributions/${id}`)
    return res.data!
  }
}