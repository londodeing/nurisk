/**
 * useWarehouses Hook
 * Custom hook for warehouse management
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '@nurisk/sdk';
import type {
  Warehouse,
  WarehouseStatus,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  AssignPICRequest,
  AssignCrewRequest,
  CreateStockRequest,
  MovementRequest,
  WarehouseStock,
  WarehouseMovement,
  WarehouseCrew,
  WarehouseEquipment,
} from '@nurisk/shared-types';

// =============================================================================
// useWarehouses
// =============================================================================

export function useWarehouses(options: { status?: WarehouseStatus; autoFetch?: boolean }) {
  const { status, autoFetch = true } = options;
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = status ? `?status=${status}` : '';
      const response = await client.get<Warehouse[]>(`/warehouses${params}`);
      setWarehouses(response as Warehouse[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { warehouses, loading, error, refetch };
}

// =============================================================================
// useWarehouse
// =============================================================================

export function useWarehouse(id: string, autoFetch = true) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<Warehouse>(`/warehouses/${id}`);
      setWarehouse(response as Warehouse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouse');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { warehouse, loading, error, refetch };
}

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

  // Add stock
  const addStock = useCallback(async (data: CreateStockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<WarehouseStock>('/warehouses/stock', data);
      return response.data as WarehouseStock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Movement
  const movement = useCallback(async (data: MovementRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post<WarehouseMovement>('/warehouses/movement', data);
      return response.data as WarehouseMovement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process movement');
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
  };
}

// =============================================================================
// useWarehouseInventory
// =============================================================================

export function useWarehouseInventory(warehouseId: string) {
  const [inventory, setInventory] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<WarehouseStock[]>(`/warehouses/${warehouseId}/inventory`);
      setInventory(response as WarehouseStock[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { inventory, loading, error, refetch };
}

// =============================================================================
// useWarehouseMovements
// =============================================================================

export function useWarehouseMovements(warehouseId: string) {
  const [movements, setMovements] = useState<WarehouseMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<WarehouseMovement[]>(`/warehouses/${warehouseId}/movements`);
      setMovements(response as WarehouseMovement[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { movements, loading, error, refetch };
}

// =============================================================================
// useWarehouseCrew
// =============================================================================

export function useWarehouseCrew(warehouseId: string) {
  const [crew, setCrew] = useState<WarehouseCrew[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<WarehouseCrew[]>(`/warehouses/${warehouseId}/crew`);
      setCrew(response as WarehouseCrew[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crew');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { crew, loading, error, refetch };
}

// =============================================================================
// useWarehouseEquipment
// =============================================================================

export function useWarehouseEquipment(warehouseId: string) {
  const [equipment, setEquipment] = useState<WarehouseEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<WarehouseEquipment[]>(`/warehouses/${warehouseId}/equipment`);
      setEquipment(response as WarehouseEquipment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { equipment, loading, error, refetch };
}

// =============================================================================
// useStockAlerts
// =============================================================================

export function useStockAlerts(warehouseId: string) {
  const [alerts, setAlerts] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await client.get<WarehouseStock[]>(`/warehouses/${warehouseId}/alerts`);
      setAlerts(response as WarehouseStock[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { alerts, loading, error, refetch };
}