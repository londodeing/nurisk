// Shelters SDK Module

import { SdkClient, buildPaginationParams } from '../core'
import type {
  Shelter,
  CreateShelterRequest,
  UpdateShelterRequest,
  ActivateShelterRequest,
  AssignPICRequest,
  AssignCrewRequest,
  UpdateOccupancyRequest,
  ShelterOccupancy,
  ShelterCrewAssignment,
  ShelterAmenity,
  ShelterEquipment,
} from '@nurisk/shared-types/shelter'

import type { ListResponse, PaginationRequest } from '@nurisk/shared-types'

export class SheltersApi {
  constructor(private client: SdkClient) {}

  async list(filter?: Record<string, unknown> & PaginationRequest): Promise<ListResponse<Shelter>> {
    const params = { ...buildPaginationParams(filter ?? {}), ...filter }
    const res = await this.client.get<ListResponse<Shelter>>('/shelters', { params })
    return res.data!
  }

  async getById(id: string): Promise<Shelter> {
    const res = await this.client.get<Shelter>(`/shelters/${id}`)
    return res.data!
  }

  async create(data: CreateShelterRequest): Promise<Shelter> {
    const res = await this.client.post<Shelter>('/shelters', data)
    return res.data!
  }

  async update(id: string, data: UpdateShelterRequest): Promise<Shelter> {
    const res = await this.client.patch<Shelter>(`/shelters/${id}`, data)
    return res.data!
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/shelters/${id}`)
  }

  async activate(data: ActivateShelterRequest): Promise<Shelter> {
    const res = await this.client.post<Shelter>('/shelters/activate', data)
    return res.data!
  }

  async deactivate(id: string): Promise<void> {
    await this.client.post(`/shelters/${id}/deactivate`)
  }

  async assignPIC(data: AssignPICRequest): Promise<void> {
    await this.client.post('/shelters/assign-pic', data)
  }

  async assignCrew(data: AssignCrewRequest): Promise<ShelterCrewAssignment> {
    const res = await this.client.post<ShelterCrewAssignment>('/shelters/assign-crew', data)
    return res.data!
  }

  async removeCrew(shelterId: string, volunteerId: string): Promise<void> {
    await this.client.delete(`/shelters/${shelterId}/crew/${volunteerId}`)
  }

  async updateOccupancy(data: UpdateOccupancyRequest): Promise<ShelterOccupancy> {
    const res = await this.client.post<ShelterOccupancy>('/shelters/update-occupancy', data)
    return res.data!
  }

  async getOccupancy(id: string): Promise<ShelterOccupancy> {
    const res = await this.client.get<ShelterOccupancy>(`/shelters/${id}/occupancy`)
    return res.data!
  }

  async getAmenities(id: string): Promise<ShelterAmenity[]> {
    const res = await this.client.get<ShelterAmenity[]>(`/shelters/${id}/amenities`)
    return res.data!
  }

  async getEquipment(id: string): Promise<ShelterEquipment[]> {
    const res = await this.client.get<ShelterEquipment[]>(`/shelters/${id}/equipment`)
    return res.data!
  }
}