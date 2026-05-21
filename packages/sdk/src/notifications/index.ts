// Notifications SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Notification,
  NotificationPreferences,
  NotificationFilter,
  NotificationStatistics,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

export class NotificationsApi {
  constructor(private client: SdkClient) {}

  async list(filter?: NotificationFilter & PaginationRequest): Promise<ListResponse<Notification>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Notification>>('/notifications', { params })
    return res.data!
  }

  async getById(id: string): Promise<Notification> {
    const res = await this.client.get<Notification>(`/notifications/${id}`)
    return res.data!
  }

  async markAsRead(id: string): Promise<void> {
    await this.client.post(`/notifications/${id}/read`)
  }

  async markAllAsRead(): Promise<void> {
    await this.client.post('/notifications/read-all')
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/notifications/${id}`)
  }

  async deleteAll(): Promise<void> {
    await this.client.delete('/notifications')
  }

  // Preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await this.client.get<NotificationPreferences>('/notifications/preferences')
    return res.data!
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const res = await this.client.patch<NotificationPreferences>('/notifications/preferences', preferences)
    return res.data!
  }

  // Statistics
  async getStatistics(): Promise<NotificationStatistics> {
    const res = await this.client.get<NotificationStatistics>('/notifications/statistics')
    return res.data!
  }
}