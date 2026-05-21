// Mission SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Mission,
  MissionFilter,
  MissionAssignment,
  MissionReport,
  ListResponse,
  PaginationRequest,
} from '@nurisk/shared-types'

type CreateMissionData = Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>
type UpdateMissionData = Partial<Mission>
type AssignTeamData = Omit<MissionAssignment, 'id' | 'assignedAt'>

export class MissionsApi {
  constructor(private client: SdkClient) {}

  async list(filter?: MissionFilter & PaginationRequest): Promise<ListResponse<Mission>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Mission>>('/missions', { params })
    return res.data!
  }

  async getById(id: string): Promise<Mission> {
    const res = await this.client.get<Mission>(`/missions/${id}`)
    return res.data!
  }

  async create(data: CreateMissionData): Promise<Mission> {
    const res = await this.client.post<Mission>('/missions', data)
    return res.data!
  }

  async update(id: string, data: UpdateMissionData): Promise<Mission> {
    const res = await this.client.patch<Mission>(`/missions/${id}`, data)
    return res.data!
  }

  async assignTeam(missionId: string, data: AssignTeamData): Promise<MissionAssignment> {
    const res = await this.client.post<MissionAssignment>(`/missions/${missionId}/assign`, data)
    return res.data!
  }

  async generateReport(missionId: string): Promise<MissionReport> {
    const res = await this.client.post<MissionReport>(`/missions/${missionId}/report`)
    return res.data!
  }
}
