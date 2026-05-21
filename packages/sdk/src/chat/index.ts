// Chat SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Conversation,
  Message,
  ConversationMember,
  SendMessageRequest,
  ChatFilter,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

export class ChatApi {
  constructor(private client: SdkClient) {}

  // Conversations
  async getConversations(filter?: ChatFilter & PaginationRequest): Promise<ListResponse<Conversation>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Conversation>>('/chat/conversations', { params })
    return res.data!
  }

  async getConversationById(id: string): Promise<Conversation> {
    const res = await this.client.get<Conversation>(`/chat/conversations/${id}`)
    return res.data!
  }

  async createConversation(data: { type: string; name?: string; description?: string; participantIds: string[] }): Promise<Conversation> {
    const res = await this.client.post<Conversation>('/chat/conversations', data)
    return res.data!
  }

  async updateConversation(id: string, data: { name?: string; description?: string }): Promise<Conversation> {
    const res = await this.client.patch<Conversation>(`/chat/conversations/${id}`, data)
    return res.data!
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/chat/conversations/${id}`)
  }

  async addParticipant(conversationId: string, userId: string): Promise<ConversationMember> {
    const res = await this.client.post<ConversationMember>(`/chat/conversations/${conversationId}/participants`, { userId })
    return res.data!
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    await this.client.delete(`/chat/conversations/${conversationId}/participants/${userId}`)
  }

  async getParticipants(conversationId: string): Promise<ConversationMember[]> {
    const res = await this.client.get<ConversationMember[]>(`/chat/conversations/${conversationId}/participants`)
    return res.data!
  }

  // Messages
  async getMessages(conversationId: string, filter?: PaginationRequest): Promise<ListResponse<Message>> {
    const params = { ...buildPaginationParams(filter ?? {}) }
    const res = await this.client.get<ListResponse<Message>>(`/chat/conversations/${conversationId}/messages`, { params })
    return res.data!
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    const res = await this.client.post<Message>(`/chat/conversations/${conversationId}/messages`, data)
    return res.data!
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await this.client.delete(`/chat/conversations/${conversationId}/messages/${messageId}`)
  }

  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    await this.client.post(`/chat/conversations/${conversationId}/messages/${messageId}/read`)
  }

  // Typing indicator
  async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await this.client.post(`/chat/conversations/${conversationId}/typing`, { isTyping })
  }

  // Search messages (GOVERNANCE: added to block raw axios in frontend)
  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    const params: Record<string, string> = { q: query }
    if (conversationId) params.conversationId = conversationId
    const res = await this.client.get<Message[]>('/chat/messages/search', { params })
    return res.data!
  }

  // Upload attachment (GOVERNANCE: added to block raw axios in frontend)
  async uploadAttachment(file: File): Promise<{ url: string; name: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await this.client.post<{ url: string; name: string }>('/chat/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data!
  }
}