// Resource Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import { sdk } from './api';
import type { Resource, ResourceType, ResourceAllocation, ResourceForecast } from '@nurisk/shared-types/resource';

export type { Resource, ResourceType, ResourceAllocation, ResourceForecast };

// Re-export SDK methods for service compatibility
export const getResources = () => sdk.resource.list();
export const getResourceById = (id: string) => sdk.resource.getById(id);
export const createResource = (data: Partial<Resource>) => sdk.resource.create(data);
export const updateResource = (id: string, data: Partial<Resource>) => sdk.resource.update(id, data);
export const deleteResource = (id: string) => sdk.resource.delete(id);
export const allocateResource = (data: ResourceAllocation) => sdk.resource.allocate(data);
export const getResourceStats = () => sdk.resource.getStats();
export const getResourceForecast = (type?: ResourceType) => sdk.resource.getForecast(type);