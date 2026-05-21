import { Injectable } from '@nestjs/common';

import { LogisticsRequest, LogisticsRepository } from './logistics.repository';
import { LogisticsFilter } from '@nurisk/shared-types/logistics';

import type { LogisticsStats, SupplyItem, Transport, Fulfillment } from '@nurisk/shared-types';

@Injectable()
export class LogisticsService {
  constructor(private logisticsRepository: LogisticsRepository) {}

  async create(data: Partial<LogisticsRequest>): Promise<LogisticsRequest> {
    return this.logisticsRepository.create(data);
  }

  async findAll(filters: LogisticsFilter): Promise<LogisticsRequest[]> {
    return this.logisticsRepository.findAll(filters);
  }

  async findById(id: number): Promise<LogisticsRequest | null> {
    return this.logisticsRepository.findById(id);
  }

  async updateStatus(id: number, status: string, adminNote?: string): Promise<LogisticsRequest | null> {
    return this.logisticsRepository.updateStatus(id, status, adminNote);
  }

  async approve(id: number, approvedBy: string): Promise<LogisticsRequest | null> {
    return this.logisticsRepository.approve(id, approvedBy);
  }

  async reject(id: number, reason: string): Promise<LogisticsRequest | null> {
    return this.logisticsRepository.reject(id, reason);
  }

  async fulfill(id: number, items: { inventory_id: number; quantity: number }[], fulfilledBy: string): Promise<LogisticsRequest | null> {
    return this.logisticsRepository.fulfill(id, items, fulfilledBy);
  }
}