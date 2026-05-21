/**
 * @deprecated
 * Transitional compatibility wrapper.
 * Use @nurisk/sdk/shelter instead.
 *
 * This module delegates all requests to ShelterApi from @nurisk/sdk.
 * Direct HTTP logic has been moved to the SDK for centralized transport management.
 */
import { ShelterApi } from '@nurisk/sdk/shelter'
import type { Shelter } from '@nurisk/shared-types/shelter'

export type { Warehouse, VolunteerMission, Equipment } from '@nurisk/sdk/shelter'

// Create singleton instance
const shelterApi = new ShelterApi({
  baseUrl: typeof window !== 'undefined'
    ? (window as unknown as { ENV?: { API_BASE_URL?: string } }).ENV?.API_BASE_URL ?? '/api'
    : '/api'
})

// =============================================================================
// Shelters API
// =============================================================================

/**
 * Get all shelters
 * @deprecated Use shelterApi.getAll() from @nurisk/sdk/shelter instead
 */
export const shelterService = {
  async getAll(params?: { status?: string; district?: string }): Promise<Shelter[]> {
    return shelterApi.getAll(params)
  },

  async getById(id: string): Promise<Shelter> {
    return shelterApi.getById(id)
  },

  async activate(id: string): Promise<Shelter> {
    return shelterApi.activate(id)
  },

  async deactivate(id: string): Promise<Shelter> {
    return shelterApi.deactivate(id)
  },

  async assignPic(id: string, userId: string): Promise<Shelter> {
    return shelterApi.assignPic(id, userId)
  },

  async assignCrew(id: string, crewIds: string[]): Promise<Shelter> {
    return shelterApi.assignCrew(id, crewIds)
  },

  async removeCrew(id: string, crewId: string): Promise<Shelter> {
    return shelterApi.removeCrew(id, crewId)
  },

  async getOccupancy(id: string): Promise<{ capacity: number; current: number }> {
    return shelterApi.getOccupancy(id)
  },
}

// =============================================================================
// Warehouses API
// =============================================================================

/**
 * Get all warehouses
 * @deprecated Use shelterApi.getWarehouses() from @nurisk/sdk/shelter instead
 */
export const warehouseService = {
  async getAll(params?: { status?: string; type?: string; district?: string }): Promise<{
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
  }[]> {
    return shelterApi.getWarehouses(params)
  },

  async getById(id: string): Promise<{
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
  }> {
    return shelterApi.getWarehouseById(id)
  },

  async assignPic(id: string, userId: string): Promise<{
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
  }> {
    return shelterApi.assignWarehousePic(id, userId)
  },

  async assignCrew(id: string, crewIds: string[]): Promise<{
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
  }> {
    return shelterApi.assignWarehouseCrew(id, crewIds)
  },

  async removeCrew(id: string, crewId: string): Promise<{
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
  }> {
    return shelterApi.removeWarehouseCrew(id, crewId)
  },

  async getStock(id: string): Promise<{ capacity: number; current: number }> {
    return shelterApi.getWarehouseStock(id)
  },
}

// =============================================================================
// Volunteers/Missions API
// =============================================================================

/**
 * Get volunteers for a mission
 * @deprecated Use shelterApi.getVolunteersByMission() from @nurisk/sdk/shelter instead
 */
export const volunteerMissionService = {
  async getByMission(missionId: string): Promise<{
    id: string
    volunteerId: string
    missionId: string
    role: 'leader' | 'member' | 'logistic' | 'medical'
    status: 'assigned' | 'enroute' | 'arrived' | 'completed'
    assignedAt: string
    startedAt?: string
    completedAt?: string
  }[]> {
    return shelterApi.getVolunteersByMission(missionId)
  },

  async assignToMission(
    missionId: string,
    volunteerId: string,
    role: 'leader' | 'member' | 'logistic' | 'medical'
  ): Promise<{
    id: string
    volunteerId: string
    missionId: string
    role: 'leader' | 'member' | 'logistic' | 'medical'
    status: 'assigned' | 'enroute' | 'arrived' | 'completed'
    assignedAt: string
    startedAt?: string
    completedAt?: string
  }> {
    return shelterApi.assignToMission(missionId, volunteerId, role)
  },

  async updateStatus(
    missionId: string,
    volunteerId: string,
    status: 'assigned' | 'enroute' | 'arrived' | 'completed'
  ): Promise<{
    id: string
    volunteerId: string
    missionId: string
    role: 'leader' | 'member' | 'logistic' | 'medical'
    status: 'assigned' | 'enroute' | 'arrived' | 'completed'
    assignedAt: string
    startedAt?: string
    completedAt?: string
  }> {
    return shelterApi.updateMissionStatus(missionId, volunteerId, status)
  },

  async removeFromMission(missionId: string, volunteerId: string): Promise<void> {
    return shelterApi.removeFromMission(missionId, volunteerId)
  },
}

// =============================================================================
// Equipment API
// =============================================================================

/**
 * Get all equipment
 * @deprecated Use shelterApi.getEquipment() from @nurisk/sdk/shelter instead
 */
export const equipmentService = {
  async getAll(params?: { category?: string; condition?: string; warehouseId?: string }): Promise<{
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
  }[]> {
    return shelterApi.getEquipment(params)
  },

  async getById(id: string): Promise<{
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
  }> {
    return shelterApi.getEquipmentById(id)
  },

  async create(data: Partial<{
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
  }>): Promise<{
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
  }> {
    return shelterApi.createEquipment(data)
  },

  async update(id: string, data: Partial<{
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
  }>): Promise<{
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
  }> {
    return shelterApi.updateEquipment(id, data)
  },

  async delete(id: string): Promise<void> {
    return shelterApi.deleteEquipment(id)
  },

  async transferToWarehouse(id: string, warehouseId: string, quantity: number): Promise<{
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
  }> {
    return shelterApi.transferToWarehouse(id, warehouseId, quantity)
  },

  async transferToShelter(id: string, shelterId: string, quantity: number): Promise<{
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
  }> {
    return shelterApi.transferToShelter(id, shelterId, quantity)
  },

  async scheduleMaintenance(id: string, date: string): Promise<{
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
  }> {
    return shelterApi.scheduleMaintenance(id, date)
  },
}

// Re-export types for backward compatibility
export type { Shelter, ShelterOccupancy, ShelterCrewAssignment, ShelterPIC, CreateShelterRequest, UpdateShelterRequest, ActivateShelterRequest, AssignPICRequest, AssignCrewRequest, UpdateOccupancyRequest, ShelterFilter } from '@nurisk/shared-types/shelter'