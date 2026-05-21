import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client } from '@nurisk/sdk';

export interface BmkgEarthquake {
  id: string;
  dateTime: string;
  lat: number;
  lon: number;
  magnitude: number;
  depth: number;
  location: string;
  depthText: string;
  potentialTsunami: 'tsunami' | 'no tsunami' | 'unknown';
  felt: number;
  shakemap: string;
}

interface BmkgResponse {
  infogempa: {
    gempa: {
      Tanggal: string;
      Jam: string;
      DateTime: string;
      Coordinates: string;
      Lintang: string;
      Bujur: string;
      Magnitude: string;
      Kedalaman: string;
      Wilayah: string;
      Potensi: string;
      Dirasakan: string;
      shakemap: string;
    }[];
  };
}

const BMKG_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';

function parseCoordinates(coordStr: string): { lat: number; lon: number } {
  const [lat, lon] = coordStr.split(',').map(Number);
  return { lat, lon };
}

function parseDepth(depthStr: string): { value: number; text: string } {
  const match = depthStr.match(/(\d+)\s*km/i);
  return {
    value: match ? parseInt(match[1]) : 0,
    text: depthStr,
  };
}

function parseMagnitude(magStr: string): number {
  const match = magStr.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseEarthquakes(data: BmkgResponse): BmkgEarthquake[] {
  if (!data?.infogempa?.gempa) return [];
  
  return data.infogempa.gempa.map((gempa, index) => {
    const coords = parseCoordinates(gempa.Coordinates);
    const depth = parseDepth(gempa.Kedalaman);
    const magnitude = parseMagnitude(gempa.Magnitude);
    
    return {
      id: `bmkg-${index}-${gempa.DateTime}`,
      dateTime: gempa.DateTime,
      lat: coords.lat,
      lon: coords.lon,
      magnitude,
      depth: depth.value,
      location: gempa.Wilayah,
      depthText: depth.text,
      potentialTsunami: (gempa.Potensi.toLowerCase().includes('tsunami') 
        ? 'tsunami' 
        : 'unknown') as 'tsunami' | 'no tsunami' | 'unknown',
      felt: parseInt(gempa.Dirasakan) || 0,
      shakemap: gema.shakemap,
    };
  });
}

async function fetchBmkgEarthquakes(): Promise<BmkgEarthquake[]> {
  try {
    const response = await fetch(BMKG_URL);
    if (!response.ok) {
      throw new Error('BMKG server unavailable');
    }
    const data: BmkgResponse = await response.json();
    return parseEarthquakes(data);
  } catch (error) {
    console.error('BMKG fetch error:', error);
    // Try fallback API if BMKG is down
    try {
      const data = await client.get<BmkgEarthquake[]>('/earthquakes');
      if (!data || data.length === 0) {
        throw new Error('No earthquake data available');
      }
      return data;
    } catch (fallbackError) {
      // Propagate error instead of silent fallback
      throw new Error(
        `Failed to fetch earthquake data: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
      );
    }
  }
}

export function useBmkgEarthquakes() {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['bmkg-earthquakes'],
    queryFn: fetchBmkgEarthquakes,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
    retry: 2,
  });

  return {
    earthquakes: data || [],
    isLoading,
    isRefreshing: isFetching,
    error,
    refetch,
  };
}

export default useBmkgEarthquakes;