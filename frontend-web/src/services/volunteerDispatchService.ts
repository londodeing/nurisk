// Volunteer Dispatch Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import {
  VolunteerDispatchApi,
} from '@nurisk/sdk/volunteer-dispatch'

import type {
  Volunteer,
} from '@nurisk/shared-types/volunteer'

import type {
  Incident,
  DispatchRequest,
} from '@nurisk/shared-types/volunteer-dispatch'

import type {
  AvailabilitySlot,
  Deployment,
  SkillMatch,
} from '@nurisk/shared-types/volunteer-dispatch'

export type {
  Volunteer,
  Incident,
  DispatchRequest,
  AvailabilitySlot,
  Deployment,
  SkillMatch,
}

// Create SDK instance
const volunteerDispatchApi = new VolunteerDispatchApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const getVolunteers = () => volunteerDispatchApi.getVolunteers()
export const getVolunteerById = (id: string) => volunteerDispatchApi.getVolunteerById(id)
export const getAvailableVolunteers = (skills?: string[]) => volunteerDispatchApi.getAvailableVolunteers(skills)
export const dispatchVolunteers = (data: DispatchRequest) => volunteerDispatchApi.dispatchVolunteers(data)
export const getIncidents = () => volunteerDispatchApi.getIncidents()
export const getIncidentById = (id: string) => volunteerDispatchApi.getIncidentById(id)
export const createIncident = (data: Parameters<typeof volunteerDispatchApi.createIncident>[0]) => volunteerDispatchApi.createIncident(data)
export const updateIncident = (id: string, data: Parameters<typeof volunteerDispatchApi.updateIncident>[1]) =>
  volunteerDispatchApi.updateIncident(id, data)
export const getSkillMatches = (incidentId: string) => volunteerDispatchApi.getSkillMatches(incidentId)
export const getDeployments = (volunteerId?: string) => volunteerDispatchApi.getDeployments(volunteerId)

// Utility functions
export const getPriorityColor = (priority: Incident['priority']): string => {
  const colors: Record<Incident['priority'], string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return colors[priority] ?? '#6b7280'
}

export const getPriorityLabel = (priority: Incident['priority']): string => {
  const labels: Record<Incident['priority'], string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  }
  return labels[priority] ?? priority
}

export const getSkillLabel = (skill: string): string => {
  const labels: Record<string, string> = {
    first_aid: 'First Aid',
    search_rescue: 'Search & Rescue',
    medical: 'Medical',
    communication: 'Communication',
    logistics: 'Logistics',
    driving: 'Driving',
    cooking: 'Cooking',
    translation: 'Translation',
  }
  return labels[skill] ?? skill
}

export const getVolunteerStatusColor = (status: Volunteer['status']): string => {
  const colors: Record<Volunteer['status'], string> = {
    available: '#22c55e',
    deployed: '#f59e0b',
    unavailable: '#ef4444',
  }
  return colors[status] ?? '#6b7280'
}

export const getVolunteerStatusLabel = (status: Volunteer['status']): string => {
  const labels: Record<Volunteer['status'], string> = {
    available: 'Available',
    deployed: 'Deployed',
    unavailable: 'Unavailable',
  }
  return labels[status] ?? status
}

// Mock data for backward compatibility
export const MOCK_INCIDENT: Incident = {
  id: 'incident-001',
  title: 'Flood Response - Jakarta',
  location: { lat: -6.2088, lng: 106.8456 },
  priority: 'high',
  requiredSkills: ['first_aid', 'search_rescue'],
  requiredCount: 10,
  assignedCount: 0,
  status: 'open',
}

export const MOCK_SKILL_MATCHES: SkillMatch[] = []