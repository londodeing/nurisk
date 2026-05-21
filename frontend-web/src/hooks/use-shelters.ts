/**
 * useShelters Hook
 * Custom hook for shelter management
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '@nurisk/sdk';
import type {
  Shelter,
  ShelterStatus,
  CreateShelterRequest,
  UpdateShelterRequest,
  ActivateShelterRequest,
  AssignPICRequest,
  AssignCrewRequest,
  UpdateOccupancyRequest,
  ShelterOccupancy,
  ShelterCrewAssignment,
  ShelterEquipment,
  ShelterTimelineEvent,
} from '@nurisk/shared-types';

// =============================================================================
// useShelters
// =============================================================================

export function useShelters(options: { status?: ShelterStatus; autoFetch?: boolean }) {
  const { status, autoFetch = true } = options;
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = status ? `?status=${status}` : '';
      const response = await client.get<Shelter[]>(`/shelters${params}`);
      setShelters(response as Shelter[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shelters');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { shelters, loading, error, refetch };
}

// =============================================================================
// useShelter
// =============================================================================

export function useShelter(id: string, autoFetch = true) {
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<Shelter>(`/shelters/${id}`);
      setShelter(response as Shelter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shelter');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { shelter, loading, error, refetch };
}

// =============================================================================
// useShelterOperations
// =============================================================================

export function useShelterOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create shelter
  const createShelter = useCallback(async (data: CreateShelterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Shelter>('/shelters', data);
      return response.data as Shelter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shelter');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update shelter
  const updateShelter = useCallback(async (id: string, data: UpdateShelterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.patch<Shelter>(`/shelters/${id}`, data);
      return response.data as Shelter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shelter');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Activate shelter (commander authorization)
  const activateShelter = useCallback(async (data: ActivateShelterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Shelter>('/shelters/activate', data);
      return response.data as Shelter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate shelter');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign PIC
  const assignPIC = useCallback(async (data: AssignPICRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Shelter>('/shelters/assign-pic', data);
      return response.data as Shelter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign PIC');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign crew
  const assignCrew = useCallback(async (data: AssignCrewRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Shelter>('/shelters/assign-crew', data);
      return response.data as Shelter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign crew');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update occupancy
  const updateOccupancy = useCallback(async (data: UpdateOccupancyRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<ShelterOccupancy>('/shelters/occupancy', data);
      return response.data as ShelterOccupancy;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update occupancy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createShelter,
    updateShelter,
    activateShelter,
    assignPIC,
    assignCrew,
    updateOccupancy,
  };
}

// =============================================================================
// useShelterOccupancy
// =============================================================================

export function useShelterOccupancy(shelterId: string) {
  const [occupancy, setOccupancy] = useState<ShelterOccupancy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shelterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<ShelterOccupancy>(`/shelters/${shelterId}/occupancy`);
      setOccupancy(response as ShelterOccupancy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch occupancy');
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { occupancy, loading, error, refetch };
}

// =============================================================================
// useShelterCrew
// =============================================================================

export function useShelterCrew(shelterId: string) {
  const [crew, setCrew] = useState<ShelterCrewAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shelterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<ShelterCrewAssignment[]>(`/shelters/${shelterId}/crew`);
      setCrew(response as ShelterCrewAssignment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crew');
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { crew, loading, error, refetch };
}

// =============================================================================
// useShelterEquipment
// =============================================================================

export function useShelterEquipment(shelterId: string) {
  const [equipment, setEquipment] = useState<ShelterEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shelterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<ShelterEquipment[]>(`/shelters/${shelterId}/equipment`);
      setEquipment(response as ShelterEquipment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { equipment, loading, error, refetch };
}

// =============================================================================
// useShelterTimeline
// =============================================================================

export function useShelterTimeline(shelterId: string) {
  const [events, setEvents] = useState<ShelterTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!shelterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<ShelterTimelineEvent[]>(`/shelters/${shelterId}/timeline`);
      setEvents(response as ShelterTimelineEvent[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}

// =============================================================================
// useMissionVolunteers
// =============================================================================

export function useMissionVolunteers(incidentId: string) {
  const [volunteers, setVolunteers] = useState<{ id: string; name: string; role: string; skills: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await client.get<{ id: string; name: string; role: string; skills: string[] }[]>(`/volunteers/mission/${incidentId}`);
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { volunteers, loading, error, refetch };
}
