/**
 * NURisk SDK - Shelter API
 * Shelter and warehouse management
 */
import type { Shelter, ShelterOccupancy, ShelterCrewAssignment, ShelterPIC, ShelterAmenity, ShelterEquipment, ShelterActivation, CreateShelterRequest, UpdateShelterRequest, ActivateShelterRequest, AssignPICRequest, AssignCrewRequest, UpdateOccupancyRequest, ShelterFilter } from '@nurisk/shared-types/shelter'

export type { Shelter, ShelterOccupancy, ShelterCrewAssignment, ShelterPIC, ShelterAmenity, ShelterEquipment, ShelterActivation, CreateShelterRequest, UpdateShelterRequest, ActivateShelterRequest, AssignPICRequest, AssignCrewRequest, UpdateOccupancyRequest, ShelterFilter } from '@nurisk/shared-types/shelter'

export interface Warehouse {
  id: string
  name: string
  address: string
  district: string
  regency: string
  province: string
  latitude: number
  longitude: number
  capacity: number
  currentStock: number
  status: 'active' | 'inactive'
  type: 'logistics' | 'food' | 'medical' | 'equipment'
  contactPerson?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
}

export interface VolunteerMission {
  id: string
  volunteerId: string
  missionId: string
  role: 'leader' | 'member' | 'logistic' | 'medical'
  status: 'assigned' | 'enroute' | 'arrived' | 'completed'
  assignedAt: string
  startedAt?: string
  completedAt?: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  quantity: number
  available: number
  condition: 'good' | 'maintenance' | 'damaged'
  location: string
  warehouseId?: string
  shelterId?: string
  lastMaintenance?: string
  createdAt: string
  updatedAt: string
}

export interface ShelterApiConfig {
  baseUrl?: string
}

export class ShelterApi {
  private baseUrl: string

  constructor(config: ShelterApiConfig = {}) {
    this.baseUrl = config.baseUrl ?? '/api'
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`ShelterApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // =============================================================================
  // Shelters
  // =============================================================================

  /**
   * Get all shelters
   */
  async getAll(params?: { status?: string; district?: string }): Promise<Shelter[]> {
    return this.request<Shelter[]>('/shelters', { method: 'GET' })
  }

  /**
   * Get shelter by ID
   */
  async getById(id: string): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}`)
  }

  /**
   * Activate shelter
   */
  async activate(id: string): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}/activate`, { method: 'POST' })
  }

  /**
   * Deactivate shelter
   */
  async deactivate(id: string): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}/deactivate`, { method: 'POST' })
  }

  /**
   * Assign PIC to shelter
   */
  async assignPic(id: string, userId: string): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}/assign-pic`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  /**
   * Assign crew to shelter
   */
  async assignCrew(id: string, crewIds: string[]): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}/assign-crew`, {
      method: 'POST',
      body: JSON.stringify({ crewIds }),
    })
  }

  /**
   * Remove crew from shelter
   */
  async removeCrew(id: string, crewId: string): Promise<Shelter> {
    return this.request<Shelter>(`/shelters/${id}/crew/${crewId}`, { method: 'DELETE' })
  }

  /**
   * Get shelter occupancy
   */
  async getOccupancy(id: string): Promise<{ capacity: number; current: number }> {
    return this.request<{ capacity: number; current: number }>(`/shelters/${id}/occupancy`)
  }

  // =============================================================================
  // Warehouses
  // =============================================================================

  /**
   * Get all warehouses
   */
  async getWarehouses(params?: { status?: string; type?: string; district?: string }): Promise<Warehouse[]> {
    return this.request<Warehouse[]>('/warehouses')
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(id: string): Promise<Warehouse> {
    return this.request<Warehouse>(`/warehouses/${id}`)
  }

  /**
   * Assign PIC to warehouse
   */
  async assignWarehousePic(id: string, userId: string): Promise<Warehouse> {
    return this.request<Warehouse>(`/warehouses/${id}/assign-pic`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  /**
   * Assign crew to warehouse
   */
  async assignWarehouseCrew(id: string, crewIds: string[]): Promise<Warehouse> {
    return this.request<Warehouse>(`/warehouses/${id}/assign-crew`, {
      method: 'POST',
      body: JSON.stringify({ crewIds }),
    })
  }

  /**
   * Remove crew from warehouse
   */
  async removeWarehouseCrew(id: string, crewId: string): Promise<Warehouse> {
    return this.request<Warehouse>(`/warehouses/${id}/crew/${crewId}`, { method: 'DELETE' })
  }

  /**
   * Get warehouse stock
   */
  async getWarehouseStock(id: string): Promise<{ capacity: number; current: number }> {
    return this.request<{ capacity: number; current: number }>(`/warehouses/${id}/stock`)
  }

  // =============================================================================
  // Volunteer Missions
  // =============================================================================

  /**
   * Get volunteers for a mission
   */
  async getVolunteersByMission(missionId: string): Promise<VolunteerMission[]> {
    return this.request<VolunteerMission[]>(`/volunteers/mission/${missionId}`)
  }

  /**
   * Assign volunteer to mission
   */
  async assignToMission(
    missionId: string,
    volunteerId: string,
    role: VolunteerMission['role']
  ): Promise<VolunteerMission> {
    return this.request<VolunteerMission>(`/volunteers/mission/${missionId}`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId, role }),
    })
  }

  /**
   * Update volunteer status in mission
   */
  async updateMissionStatus(
    missionId: string,
    volunteerId: string,
    status: VolunteerMission['status']
  ): Promise<VolunteerMission> {
    return this.request<VolunteerMission>(`/volunteers/mission/${missionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ volunteerId, status }),
    })
  }

  /**
   * Remove volunteer from mission
   */
  async removeFromMission(missionId: string, volunteerId: string): Promise<void> {
    return this.request<void>(`/volunteers/mission/${missionId}`, {
      method: 'DELETE',
      body: JSON.stringify({ volunteerId }),
    })
  }

  // =============================================================================
  // Equipment
  // =============================================================================

  /**
   * Get all equipment
   */
  async getEquipment(params?: { category?: string; condition?: string; warehouseId?: string }): Promise<Equipment[]> {
    return this.request<Equipment[]>('/equipment')
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}`)
  }

  /**
   * Create equipment
   */
  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    return this.request<Equipment>('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update equipment
   */
  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(id: string): Promise<void> {
    return this.request<void>(`/equipment/${id}`, { method: 'DELETE' })
  }

  /**
   * Transfer equipment to warehouse
   */
  async transferToWarehouse(id: string, warehouseId: string, quantity: number): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ warehouseId, quantity }),
    })
  }

  /**
   * Transfer equipment to shelter
   */
  async transferToShelter(id: string, shelterId: string, quantity: number): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ shelterId, quantity }),
    })
  }

  /**
   * Schedule maintenance
   */
  async scheduleMaintenance(id: string, date: string): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}/maintenance`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    })
  }
}