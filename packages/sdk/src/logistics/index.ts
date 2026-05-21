// Logistics SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  LogisticsRequest,
  LogisticsFilter,
  LogisticsStats,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

type CreateLogisticsData = Omit<LogisticsRequest, 'id' | 'createdAt' | 'updatedAt'>
type UpdateLogisticsData = Partial<LogisticsRequest>

export class LogisticsApi {
  constructor(private client: SdkClient) {}

  async list(filter?: LogisticsFilter & PaginationRequest): Promise<ListResponse<LogisticsRequest>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<LogisticsRequest>>('/logistics', { params })
    return res.data!
  }

  async getById(id: string): Promise<LogisticsRequest> {
    const res = await this.client.get<LogisticsRequest>(`/logistics/${id}`)
    return res.data!
  }

  async create(data: CreateLogisticsData): Promise<LogisticsRequest> {
    const res = await this.client.post<LogisticsRequest>('/logistics', data)
    return res.data!
  }

  async update(id: string, data: UpdateLogisticsData): Promise<LogisticsRequest> {
    const res = await this.client.patch<LogisticsRequest>(`/logistics/${id}`, data)
    return res.data!
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/logistics/${id}`)
  }

  async getStats(): Promise<LogisticsStats> {
    const res = await this.client.get<LogisticsStats>('/logistics/stats')
    return res.data!
  }
}
