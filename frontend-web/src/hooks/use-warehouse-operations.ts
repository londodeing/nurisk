/**
 * useWarehouseOperations Hook
 * Custom hook for warehouse operations management
 */

import { useState, useCallback } from 'react';
import { client } from '@nurisk/sdk';
import type {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  AssignPICRequest,
  AssignCrewRequest,
  CreateStockRequest,
  MovementRequest,
} from '@nurisk/shared-types';

// =============================================================================
// useWarehouseOperations
// =============================================================================

export function useWarehouseOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create warehouse
  const createWarehouse = useCallback(async (data: CreateWarehouseRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Warehouse>('/warehouses', data);
      return response.data as Warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update warehouse
  const updateWarehouse = useCallback(async (id: string, data: UpdateWarehouseRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.patch<Warehouse>(`/warehouses/${id}`, data);
      return response.data as Warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
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
      const response = await client.post<Warehouse>('/warehouses/assign-pic', data);
      return response.data as Warehouse;
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
      const response = await client.post<Warehouse>('/warehouses/assign-crew', data);
      return response.data as Warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign crew');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add stock (inventory)
  const addStock = useCallback(async (data: CreateStockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Warehouse>('/warehouses/stock', data);
      return response.data as Warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Movement (inbound/outbound/transfer)
  const movement = useCallback(async (data: MovementRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<Warehouse>('/warehouses/movement', data);
      return response.data as Warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process movement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete warehouse
  const deleteWarehouse = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await client.delete<void>(`/warehouses/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    assignPIC,
    assignCrew,
    addStock,
    movement,
    deleteWarehouse,
  };
}

export default useWarehouseOperations;