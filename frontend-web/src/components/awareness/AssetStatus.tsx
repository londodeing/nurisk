'use client';

import { Truck, Users, Package, Building2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetStatusColor, getAssetTypeLabel } from '@/services/awarenessService';
import type { Asset, AssetType, AssetStatus } from '@/services/awarenessService';

interface AssetStatusProps {
  assets: Asset[];
  className?: string;
  onAssetClick?: (asset: Asset) => void;
}

export function AssetStatus({
  assets,
  className,
  onAssetClick,
}: AssetStatusProps) {
  // Group assets by type
  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<AssetType, Asset[]>);

  // Group assets by status
  const assetsByStatus = assets.reduce((acc, asset) => {
    if (!acc[asset.status]) {
      acc[asset.status] = [];
    }
    acc[asset.status].push(asset);
    return acc;
  }, {} as Record<AssetStatus, Asset[]>);

  // Calculate totals
  const totalAssets = assets.length;
  const availableCount = assetsByStatus.available?.length ?? 0;
  const deployedCount = assetsByStatus.deployed?.length ?? 0;
  const maintenanceCount = assetsByStatus.maintenance?.length ?? 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">{totalAssets}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{availableCount}</p>
              <p className="text-xs text-slate-500">Tersedia</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{deployedCount}</p>
              <p className="text-xs text-slate-500">Ditugaskan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{maintenanceCount}</p>
              <p className="text-xs text-slate-500">Maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets by Type */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Berdasarkan Jenis</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {(['vehicle', 'equipment', 'personnel', 'shelter', 'hospital'] as AssetType[]).map(
            (type) => {
              const typeAssets = assetsByType[type] ?? [];
              const available = typeAssets.filter((a) => a.status === 'available').length;
              const total = typeAssets.length;

              return (
                <button
                  key={type}
                  onClick={() => typeAssets[0] && onAssetClick?.(typeAssets[0])}
                  className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:border-slate-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AssetTypeIcon type={type} />
                    <span className="text-xs font-medium text-slate-600">
                      {getAssetTypeLabel(type)}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-700">
                    {available}/{total}
                  </p>
                  <p className="text-xs text-slate-500">tersedia</p>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Daftar Aset</h3>
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-2 font-medium">Nama</th>
                  <th className="px-4 py-2 font-medium">Jenis</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Level</th>
                  <th className="px-4 py-2 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onAssetClick?.(asset)}
                  >
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-slate-700">
                        {asset.name}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-slate-500">
                        {getAssetTypeLabel(asset.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-2">
                      <AssetLevelIndicator asset={asset} />
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(asset.lastUpdate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function AssetTypeIcon({ type }: { type: AssetType }) {
  const icons: Record<AssetType, React.ReactNode> = {
    vehicle: <Truck className="w-4 h-4 text-blue-600" />,
    equipment: <Package className="w-4 h-4 text-amber-600" />,
    personnel: <Users className="w-4 h-4 text-green-600" />,
    shelter: <Building2 className="w-4 h-4 text-purple-600" />,
    hospital: <Heart className="w-4 h-4 text-red-600" />,
  };
  return icons[type];
}

function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const labels: Record<AssetStatus, string> = {
    available: 'Tersedia',
    deployed: 'Ditugaskan',
    maintenance: 'Maintenance',
    offline: 'Offline',
  };
  const colorClass = getAssetStatusColor(status);
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        colorClass
      )}
    >
      {labels[status]}
    </span>
  );
}

function AssetLevelIndicator({ asset }: { asset: Asset }) {
  const level = asset.batteryLevel ?? asset.fuelLevel;
  if (level === undefined) return null;

  const color =
    level > 60 ? 'bg-green-500' : level > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{level}%</span>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Baru';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export default AssetStatus;