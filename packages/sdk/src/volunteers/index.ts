// Volunteers SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Volunteer,
  Team,
  Assignment,
  CheckIn,
} from '@nurisk/shared-types/entities'
import type {
  VolunteerFilter,
  TeamFilter,
  VolunteerStatistics,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

export class VolunteersApi {
  constructor(private client: SdkClient) {}

  async list(filter?: VolunteerFilter & PaginationRequest): Promise<ListResponse<Volunteer>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Volunteer>>('/volunteers', { params })
    return res.data!
  }

  async getById(id: string): Promise<Volunteer> {
    const res = await this.client.get<Volunteer>(`/volunteers/${id}`)
    return res.data!
  }

  async getStatistics(): Promise<VolunteerStatistics> {
    const res = await this.client.get<VolunteerStatistics>('/volunteers/statistics')
    return res.data!
  }

  // Teams
  async getTeams(filter?: TeamFilter & PaginationRequest): Promise<ListResponse<Team>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Team>>('/volunteers/teams', { params })
    return res.data!
  }

  async getTeamById(id: string): Promise<Team> {
    const res = await this.client.get<Team>(`/volunteers/teams/${id}`)
    return res.data!
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    const res = await this.client.post<Team>('/volunteers/teams', data)
    return res.data!
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const res = await this.client.patch<Team>(`/volunteers/teams/${id}`, data)
    return res.data!
  }

  async deleteTeam(id: string): Promise<void> {
    await this.client.delete(`/volunteers/teams/${id}`)
  }

  async addTeamMember(teamId: string, userId: string, role?: string): Promise<void> {
    await this.client.post(`/volunteers/teams/${teamId}/members`, { userId, role })
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await this.client.delete(`/volunteers/teams/${teamId}/members/${userId}`)
  }

  // Assignments
  async getAssignments(filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<Assignment>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Assignment>>('/volunteers/assignments', { params })
    return res.data!
  }

  async getAssignmentById(id: string): Promise<Assignment> {
    const res = await this.client.get<Assignment>(`/volunteers/assignments/${id}`)
    return res.data!
  }

  async createAssignment(data: Partial<Assignment>): Promise<Assignment> {
    const res = await this.client.post<Assignment>('/volunteers/assignments', data)
    return res.data!
  }

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    const res = await this.client.patch<Assignment>(`/volunteers/assignments/${id}`, data)
    return res.data!
  }

  async completeAssignment(id: string, notes?: string): Promise<void> {
    await this.client.post(`/volunteers/assignments/${id}/complete`, { notes })
  }

  // Check-ins
  async checkIn(assignmentId: string, data: { type: string; location?: unknown; notes?: string }): Promise<CheckIn> {
    const res = await this.client.post<CheckIn>(`/volunteers/assignments/${assignmentId}/checkin`, data)
    return res.data!
  }

  async getCheckIns(assignmentId: string): Promise<CheckIn[]> {
    const res = await this.client.get<CheckIn[]>(`/volunteers/assignments/${assignmentId}/checkins`)
    return res.data!
  }
}