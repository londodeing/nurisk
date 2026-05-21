/**
 * useHazard Hook
 * 100% SDK-driven - no axios/legacy HTTP
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hazardApi } from '@nurisk/sdk';
import type { HazardZone, VulnerabilityAssessment } from '@nurisk/shared-types/hazard';
import type { DisasterType } from '@nurisk/shared-types/enums';

// Re-export for convenience
export type { HazardZone };

// Mock data for development fallback
const MOCK_HAZARD_ZONES: HazardZone[] = [];
const MOCK_VULNERABILITY_DATA: VulnerabilityAssessment[] = [];
const MOCK_VULNERABILITY_HEATMAP: { regionId: string; hazards: { hazardType: string; vulnerabilityIndex: number }[] }[] = [];

/**
 * Query keys
 */
export const hazardKeys = {
  all: ['hazard'] as const,
  zones: (filters?: object) => [...hazardKeys.all, 'zones', filters] as const,
  zone: (id: number) => [...hazardKeys.all, 'zone', id] as const,
  vulnerability: (filters?: object) => [...hazardKeys.all, 'vulnerability', filters] as const,
  vulnerabilityRegion: (regionId: string, hazardType: string) => [
    ...hazardKeys.all,
    'vulnerability',
    regionId,
    hazardType,
  ] as const,
  heatmap: () => [...hazardKeys.all, 'heatmap'] as const,
  summary: () => [...hazardKeys.all, 'summary'] as const,
  stats: (region: string) => [...hazardKeys.all, 'stats', region] as const,
  score: (region: string, hazardType: DisasterType) => [
    ...hazardKeys.all,
    'score',
    region,
    hazardType,
  ] as const,
};

/**
 * Get all hazard zones
 */
export function useHazardZones(filters?: {
  region?: string;
  hazard_type?: DisasterType;
  severity_level?: 'low' | 'moderate' | 'high' | 'extreme';
}) {
  return useQuery({
    queryKey: hazardKeys.zones(filters),
    queryFn: async () => {
      try {
        return await hazardApi.getZones(filters);
      } catch {
        return MOCK_HAZARD_ZONES;
      }
    },
  });
}

/**
 * Get hazard zone by ID
 */
export function useHazardZone(id: number) {
  return useQuery({
    queryKey: hazardKeys.zone(id),
    queryFn: async () => {
      try {
        return await hazardApi.getZoneById(String(id));
      } catch {
        return MOCK_HAZARD_ZONES.find((z) => z.id === id);
      }
    },
    enabled: !!id,
  });
}

/**
 * Create hazard zone mutation
 */
export function useCreateHazardZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { hazardTypeId: string; name: string; geometry: unknown; riskLevel: 'low' | 'moderate' | 'high' | 'extreme'; population?: number; area?: number }) =>
      hazardApi.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hazardKeys.zones() });
    },
  });
}

/**
 * Update hazard zone mutation
 */
export function useUpdateHazardZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HazardZone> }) =>
      hazardApi.updateZone(String(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hazardKeys.zone(id) });
      queryClient.invalidateQueries({ queryKey: hazardKeys.zones() });
    },
  });
}

/**
 * Delete hazard zone mutation
 */
export function useDeleteHazardZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hazardApi.deleteZone(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hazardKeys.zones() });
    },
  });
}

/**
 * Get vulnerability assessments
 */
export function useVulnerabilityAssessments(filters?: {
  regionId?: string;
  hazardZoneId?: string;
}) {
  return useQuery({
    queryKey: hazardKeys.vulnerability(filters),
    queryFn: async () => {
      try {
        return await hazardApi.getVulnerability(filters);
      } catch {
        return MOCK_VULNERABILITY_DATA;
      }
    },
  });
}

/**
 * Get vulnerability by region
 */
export function useVulnerabilityByRegion(regionId: string, hazardType: string) {
  return useQuery({
    queryKey: hazardKeys.vulnerabilityRegion(regionId, hazardType),
    queryFn: async () => {
      try {
        return await hazardApi.getVulnerabilityByRegion(regionId, hazardType);
      } catch {
        return (MOCK_VULNERABILITY_DATA as any[]).find(
          (v: any) => v.regionId === regionId,
        );
      }
    },
    enabled: !!regionId && !!hazardType,
  });
}

/**
 * Get vulnerability heatmap data
 */
export function useVulnerabilityHeatmap() {
  return useQuery({
    queryKey: hazardKeys.heatmap(),
    queryFn: async () => {
      try {
        return await hazardApi.getHeatmap();
      } catch {
        return MOCK_VULNERABILITY_HEATMAP;
      }
    },
  });
}

/**
 * Get vulnerability summary
 * SDK METHOD MISSING: getVulnerabilitySummary - using getVulnerability as fallback
 */
export function useVulnerabilitySummary() {
  return useQuery({
    queryKey: hazardKeys.summary(),
    queryFn: async () => {
      try {
        return await hazardApi.getVulnerability();
      } catch {
        return MOCK_VULNERABILITY_DATA;
      }
    },
  });
}

/**
 * Get hazard stats by region
 * SDK METHOD MISSING: getHazardStatsByRegion - using getZones as fallback
 */
export function useHazardStatsByRegion(region: string) {
  return useQuery({
    queryKey: hazardKeys.stats(region),
    queryFn: async () => {
      const data = await hazardApi.getZones({ region });
      if (!data) {
        throw new Error(`Failed to load hazard stats for region: ${region}`);
      }
      return data;
    },
    enabled: !!region,
  });
}

/**
 * Calculate vulnerability score
 * SDK METHOD MISSING: calculateVulnerabilityScore - using getVulnerabilityByRegion as fallback
 */
export function useVulnerabilityScore(region: string, hazardType: DisasterType) {
  return useQuery({
    queryKey: hazardKeys.score(region, hazardType),
    queryFn: async () => {
      const vuln = await hazardApi.getVulnerabilityByRegion(region, hazardType);
      if (!vuln) {
        throw new Error(`Failed to load vulnerability score for ${region}/${hazardType}`);
      }
      return (vuln as any)?.score ?? null;
    },
    enabled: !!region && !!hazardType,
  });
}

/**
 * Combined hazard and vulnerability data hook
 */
export function useHazardVulnerabilityData() {
  const { data: hazardZones, isLoading: hazardLoading, isError: hazardError } = useHazardZones();
  const { data: vulnerability, isLoading: vulnLoading, isError: vulnError } = useVulnerabilityAssessments();
  const { data: heatmap, isLoading: heatmapLoading, isError: heatmapError } = useVulnerabilityHeatmap();

  return {
    hazardZones: hazardZones ?? MOCK_HAZARD_ZONES,
    vulnerability: vulnerability ?? MOCK_VULNERABILITY_DATA,
    heatmap: heatmap ?? MOCK_VULNERABILITY_HEATMAP,
    isLoading: hazardLoading || vulnLoading || heatmapLoading,
    isError: hazardError || vulnError || heatmapError,
  };
}

/**
 * Filter hazard zones by type
 */
export function useHazardZonesByType(hazardType: DisasterType) {
  const { data: zones } = useHazardZones();
  if (!zones) {
    throw new Error('[hazard/zones-by-type] Invalid response: missing zones data');
  }
  const filtered = zones.filter((z) => z.hazardType === hazardType);
  return filtered;
}

/**
 * Filter vulnerability by level
 */
export function useVulnerabilityByLevel(level: 'low' | 'moderate' | 'high' | 'very_high') {
  const { data: vulnerability } = useVulnerabilityAssessments();

  const thresholds: Record<string, [number, number]> = {
    low: [0, 30],
    moderate: [30, 60],
    high: [60, 80],
    very_high: [80, 100],
  };

  const [min, max] = thresholds[level] || [0, 100];
  if (!vulnerability) {
    throw new Error('[hazard/vulnerability-by-level] Invalid response: missing vulnerability data');
  }
  const filtered = (vulnerability as any[]).filter(
    (v: any) => v.score >= min && v.score < max,
  );

  return filtered;
}