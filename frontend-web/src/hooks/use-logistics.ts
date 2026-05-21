/**
 * useLogistics Hook
 * Logistics request management
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '@nurisk/sdk';
import { toast } from '@/stores/use-ui-store';

// =============================================================================
// Types
// =============================================================================

export enum LogisticsStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LogisticsPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NeedCategory {
  SEMBAKO = 'SEMBAKO',
  SELIMUT = 'SELIMUT',
  MEDIS = 'MEDIS',
  BAYI = 'BAYI',
  AIR = 'AIR',
}

export interface LogisticsItem {
  id: string;
  category: NeedCategory;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface LogisticsRequest {
  id: string;
  requestNumber: string;
  incidentId: string;
  incidentName?: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  requesterLocation: string;
  items: LogisticsItem[];
  priority: LogisticsPriority;
  status: LogisticsStatus;
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  notes?: string;
  timeline: {
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
  approverId?: string;
  approverName?: string;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    eta?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsFilters {
  status?: LogisticsStatus;
  priority?: LogisticsPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// =============================================================================
// Hook
// =============================================================================

export function useLogistics(options: {
  autoFetch?: boolean;
  filters?: LogisticsFilters;
} = {}) {
  const { autoFetch = true, filters = {} } = options;

  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersState, setFiltersState] = useState<LogisticsFilters>(filters);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtersState.status) params.append('status', filtersState.status);
      if (filtersState.priority) params.append('priority', filtersState.priority);
      if (filtersState.startDate) params.append('start_date', filtersState.startDate);
      if (filtersState.endDate) params.append('end_date', filtersState.endDate);
      if (filtersState.search) params.append('search', filtersState.search);

      const response = await client.get<LogisticsRequest[]>(`/logistics?${params.toString()}`);
      setRequests(response as LogisticsRequest[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logistics requests';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filtersState]);

  const createRequest = useCallback(async (payload: Partial<LogisticsRequest>): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>('/logistics', payload);
    toast.success('Logistics request created');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const updateRequest = useCallback(async (id: string, payload: Partial<LogisticsRequest>): Promise<LogisticsRequest> => {
    const response = await client.patch<LogisticsRequest>(`/logistics/${id}`, payload);
    toast.success('Logistics request updated');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const approveRequest = useCallback(async (id: string): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/approve`);
    toast.success('Request approved');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const rejectRequest = useCallback(async (id: string, reason: string): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/reject`, { reason });
    toast.success('Request rejected');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const shipRequest = useCallback(async (id: string, tracking: LogisticsRequest['tracking']): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/ship`, tracking);
    toast.success('Request shipped');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const deliverRequest = useCallback(async (id: string): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/deliver`);
    toast.success('Request delivered');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const completeRequest = useCallback(async (id: string): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/complete`);
    toast.success('Request completed');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const cancelRequest = useCallback(async (id: string): Promise<LogisticsRequest> => {
    const response = await client.post<LogisticsRequest>(`/logistics/${id}/cancel`);
    toast.success('Request cancelled');
    await fetchRequests();
    return response.data as LogisticsRequest;
  }, [fetchRequests]);

  const setFilters = useCallback((newFilters: LogisticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRequests();
    }
  }, [autoFetch, fetchRequests]);

  return {
    requests,
    loading,
    error,
    filters: filtersState,
    setFilters,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    shipRequest,
    deliverRequest,
    completeRequest,
    cancelRequest,
  };
}

// =============================================================================
// Single Request Hook
// =============================================================================

export function useLogisticsRequest(id: string, autoFetch = true) {
  const [request, setRequest] = useState<LogisticsRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await client.get<LogisticsRequest>(`/logistics/${id}`);
      setRequest(data as LogisticsRequest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch request';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch) {
      fetchRequest();
    }
  }, [autoFetch, fetchRequest]);

  return {
    request,
    loading,
    error,
    refetch: fetchRequest,
  };
}