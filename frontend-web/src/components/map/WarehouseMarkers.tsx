import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import api from '@/services/api';

/**
 * @deprecated Use Warehouse from @nurisk/shared-types/warehouse after API migration
 * This interface maps API response (snake_case) to component props (camelCase)
 */
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  type: 'logistics' | 'medical' | 'equipment';
  inventory: {
    food: number;
    water: number;
    medicine: number;
    blankets: number;
    tents: number;
  };
  contact: string;
  phone: string;
}

const typeColors = {
  logistics: '#3b82f6', // blue
  medical: '#dc2626', // red
  equipment: '#8b5cf6', // purple
};

interface WarehouseMarkersProps {
  enabled?: boolean;
}

async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await api.get('/warehouses');
  return res.data.data || [];
}

export function WarehouseMarkers({ enabled = true }: WarehouseMarkersProps) {
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses', 'list', undefined],
    queryFn: fetchWarehouses,
    enabled: enabled,
  });

  if (!enabled || isLoading || !warehouses?.length) return null;

  return (
    <>
      {warehouses.map((warehouse) => (
        <WarehouseMarker key={warehouse.id} warehouse={warehouse} />
      ))}
    </>
  );
}

interface WarehouseMarkerProps {
  warehouse: Warehouse;
}

function WarehouseMarker({ warehouse }: WarehouseMarkerProps) {
  const { name, location, latitude, longitude, type, inventory, phone } = warehouse;
  
  const color = typeColors[type];
  
  const icon = useMemo(() => divIcon({
    className: 'warehouse-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7 4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), [color]);

  const typeLabel = {
    logistics: 'Logistik',
    medical: 'Medis',
    equipment: 'Peralatan',
  }[type];

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5" style={{ color }} />
            <p className="font-semibold text-sm">{name}</p>
          </div>
          <p className="text-xs text-slate-500 mb-2">{typeLabel}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Lokasi:</span> {location}</p>
            <p className="font-medium mt-2">Inventori:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p>Makanan: {inventory.food}</p>
              <p>Air: {inventory.water}</p>
              <p>Obat: {inventory.medicine}</p>
              <p>Selimut: {inventory.blankets}</p>
              <p>Tenda: {inventory.tents}</p>
            </div>
            <p><span className="font-medium">Kontak:</span> {phone}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Control component
interface WarehouseControlProps {
  enabled: boolean;
  onToggle: () => void;
  count: number;
}

export function WarehouseControl({ enabled, onToggle, count }: WarehouseControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
      <input
        type="checkbox"
        id="warehouse-toggle"
        checked={enabled}
        onChange={onToggle}
        className="w-4 h-4"
      />
      <label htmlFor="warehouse-toggle" className="flex items-center gap-2 cursor-pointer">
        <Package className="w-4 h-4 text-purple-600" />
        <span className="text-sm">Gudang</span>
      </label>
      {enabled && count > 0 && (
        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default WarehouseMarkers;