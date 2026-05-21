/**
 * NURisk SDK - Volunteer Dispatch API
 * Volunteer management and dispatch coordination
 */
import type { AvailabilitySlot, Deployment, SkillMatch } from '@nurisk/shared-types/volunteer-dispatch'

export interface Volunteer {
  id: string
  name: string
  phone?: string
  skills: string[]
  availability: AvailabilitySlot[]
  location: { lat: number; lng: number }
  status: 'available' | 'deployed' | 'unavailable'
  rating: number
  photo?: string
}

export interface Incident {
  id: string
  title: string
  location: { lat: number; lng: number }
  priority: 'low' | 'medium' | 'high' | 'critical'
  requiredSkills: string[]
  requiredCount: number
  assignedCount: number
  status: string
}

export interface DispatchRequest {
  incidentId: string
  volunteerIds: string[]
}

export interface VolunteerDispatchApiConfig {
  baseUrl?: string
}

export class VolunteerDispatchApi {
  private baseUrl: string

  constructor(config: VolunteerDispatchApiConfig = {}) {
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
      throw new Error(`VolunteerDispatchApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get nearby volunteers for an incident
   */
  async getNearbyVolunteers(
    incidentId: string,
    requiredSkills: string[],
    limit = 10
  ): Promise<SkillMatch[]> {
    return this.request<SkillMatch[]>(
      `/volunteers/nearby?incidentId=${incidentId}&skills=${requiredSkills.join(',')}&limit=${limit}`
    )
  }

  /**
   * Get all available volunteers
   */
  async getAvailableVolunteers(): Promise<Volunteer[]> {
    return this.request<Volunteer[]>('/volunteers/available')
  }

  /**
   * Get incident details
   */
  async getIncident(incidentId: string): Promise<Incident> {
    return this.request<Incident>(`/incidents/${incidentId}`)
  }

  /**
   * Get active incidents that need volunteers
   */
  async getActiveIncidents(): Promise<Incident[]> {
    return this.request<Incident[]>('/incidents/active?needsVolunteers=true')
  }

  /**
   * Deploy volunteers to an incident
   */
  async deployVolunteers(request: DispatchRequest): Promise<Deployment[]> {
    return this.request<Deployment[]>('/volunteers/deploy', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Get deployment history
   */
  async getDeployments(incidentId?: string): Promise<Deployment[]> {
    const url = incidentId
      ? `/volunteers/deployments?incidentId=${incidentId}`
      : '/volunteers/deployments'
    return this.request<Deployment[]>(url)
  }

  /**
   * Accept deployment
   */
  async acceptDeployment(deploymentId: string): Promise<Deployment> {
    return this.request<Deployment>(`/volunteers/deployments/${deploymentId}/accept`, {
      method: 'POST',
    })
  }

  /**
   * Reject deployment
   */
  async rejectDeployment(deploymentId: string): Promise<Deployment> {
    return this.request<Deployment>(`/volunteers/deployments/${deploymentId}/reject`, {
      method: 'POST',
    })
  }

  /**
   * Complete deployment
   */
  async completeDeployment(deploymentId: string): Promise<Deployment> {
    return this.request<Deployment>(`/volunteers/deployments/${deploymentId}/complete`, {
      method: 'POST',
    })
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat)
    const dLng = this.toRad(point2.lng - point1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  /**
   * Format distance
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(1)}km`
  }

  /**
   * Get volunteer status color
   */
  getVolunteerStatusColor(status: Volunteer['status']): string {
    const colors: Record<Volunteer['status'], string> = {
      available: 'bg-green-100 text-green-700',
      deployed: 'bg-amber-100 text-amber-700',
      unavailable: 'bg-slate-100 text-slate-500',
    }
    return colors[status]
  }

  /**
   * Get volunteer status label
   */
  getVolunteerStatusLabel(status: Volunteer['status']): string {
    const labels: Record<Volunteer['status'], string> = {
      available: 'Tersedia',
      deployed: 'Ditugaskan',
      unavailable: 'Tidak Tersedia',
    }
    return labels[status]
  }

  /**
   * Get skill label
   */
  getSkillLabel(skill: string): string {
    const labels: Record<string, string> = {
      rescue: 'Rescue',
      medis: 'Medis',
      logistik: 'Logistik',
      komunikasi: 'Komunikasi',
      evakuasi: 'Evakuasi',
      search: 'Search & Rescue',
      first_aid: 'First Aid',
      driving: 'Mengemudi',
      cooking: 'Memasak',
      translation: 'Translator',
    }
    return labels[skill] || skill
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: Incident['priority']): string {
    const colors: Record<Incident['priority'], string> = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      critical: 'bg-red-100 text-red-600',
    }
    return colors[priority]
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority: Incident['priority']): string {
    const labels: Record<Incident['priority'], string> = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      critical: 'Kritis',
    }
    return labels[priority]
  }
}