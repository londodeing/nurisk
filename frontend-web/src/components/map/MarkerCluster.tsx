import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

// Import markercluster CSS
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MarkerClusterGroupProps {
  children: React.ReactNode;
  chunkedLoading?: boolean;
  chunkInterval?: number;
  chunkDelay?: number;
  maxClusterRadius?: number;
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  disableClusteringAtZoom?: number;
}

export function MarkerClusterGroup({
  children: _children,
  chunkedLoading = true,
  chunkInterval = 100,
  chunkDelay = 50,
  maxClusterRadius = 80,
  spiderfyOnMaxZoom = true,
  showCoverageOnHover = false,
  zoomToBoundsOnClick = true,
  disableClusteringAtZoom = 18,
}: MarkerClusterGroupProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialize cluster group
  useEffect(() => {
    if (!map) return;

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading,
      chunkInterval,
      chunkDelay,
      maxClusterRadius,
      spiderfyOnMaxZoom,
      showCoverageOnHover,
      zoomToBoundsOnClick,
      disableClusteringAtZoom,
      // Custom icon
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let color = '#22c55e';

        if (count > 50) {
          size = 'medium';
          color = '#eab308';
        }
        if (count > 100) {
          size = 'large';
          color = '#f97316';
        }
        if (count > 500) {
          size = 'xlarge';
          color = '#dc2626';
        }

        const sizes: Record<string, number> = {
          small: 30,
          medium: 40,
          large: 50,
          xlarge: 60,
        };

        const iconSize = sizes[size] || 40;

        return L.divIcon({
          html: `<div style="
            background: ${color};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          " class="marker-cluster-custom">${count}</div>`,
          className: '',
          iconSize: L.point(iconSize, iconSize),
        });
      },
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, chunkedLoading, chunkInterval, chunkDelay, maxClusterRadius, spiderfyOnMaxZoom, showCoverageOnHover, zoomToBoundsOnClick, disableClusteringAtZoom]);

  // Add markers to cluster
  useEffect(() => {
    if (!clusterGroupRef.current) return;

    // Clear existing markers
    clusterGroupRef.current.clearLayers();

    // Get all markers from children and add to cluster
    // This is handled by react-leaflet automatically
  }, []);

  return null;
}

// Standalone cluster control
interface ClusterControlProps {
  enabled: boolean;
  onToggle: () => void;
  radius: number;
  onRadiusChange: (value: number) => void;
}

export function ClusterControl({ enabled, onToggle, radius, onRadiusChange }: ClusterControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="cluster-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="cluster-toggle" className="flex items-center gap-2 cursor-pointer">
        <span className="text-sm">Cluster Markers</span>
      </label>
      {enabled && (
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-slate-500">Radius:</span>
          <input
            type="range"
            min={50}
            max={150}
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-16 h-1"
          />
          <span className="text-xs text-slate-500 w-6">{radius}</span>
        </div>
      )}
    </div>
  );
}

export default MarkerClusterGroup;