import { create } from 'zustand';
import api from '../services/api';

interface Asset {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
}

interface Transaction {
  id: string;
  asset_name: string;
  incident_title?: string;
  status: string;
}

interface WarehouseSummary {
  total_items: number;
  total_types: number;
  lowStock?: LowStockItem[];
}

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface AssetState {
  assets: Asset[];
  transactions: Transaction[];
  warehouseSummary: WarehouseSummary | null;
  lowStock: LowStockItem[];
  isLoading: boolean;

  setAssets: (assets: Asset[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setWarehouseSummary: (summary: WarehouseSummary | null) => void;
  setLowStock: (items: LowStockItem[]) => void;
  setLoading: (loading: boolean) => void;

  fetchAssets: (params?: Record<string, string>) => Promise<void>;
  fetchWarehouseSummary: (location?: string) => Promise<void>;
  createAsset: (data: Partial<Asset>) => Promise<Asset>;
  updateAsset: (id: string, data: Partial<Asset>) => Promise<Asset>;
  requestAsset: (data: Record<string, unknown>) => Promise<unknown>;
  fetchTransactions: (params?: Record<string, string>) => Promise<void>;
  getAssetByQR: (qrCode: string) => Promise<Asset>;
}

export const useAssetStore = create<AssetState>()((set, get) => ({
  assets: [],
  transactions: [],
  warehouseSummary: null,
  lowStock: [],
  isLoading: false,

  setAssets: (assets) => set({ assets }),
  setTransactions: (transactions) => set({ transactions }),
  setWarehouseSummary: (summary) => set({ warehouseSummary: summary }),
  setLowStock: (items) => set({ lowStock: items }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchAssets: async (params = {}) => {
    set({ isLoading: true });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/assets?${queryString}`);
      set({ assets: res.data });
    } catch (err) {
      console.error('Fetch assets error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWarehouseSummary: async (location) => {
    try {
      const res = await api.get(`/assets/warehouse/summary?location=${location || ''}`);
      set({
        warehouseSummary: res.data.total,
        lowStock: res.data.lowStock
      });
    } catch (err) {
      console.error('Fetch summary error:', err);
    }
  },

  createAsset: async (data) => {
    try {
      const res = await api.post('/assets', data);
      set({ assets: [...get().assets, res.data] });
      return res.data;
    } catch (err) {
      console.error('Create asset error:', err);
      throw err;
    }
  },

  updateAsset: async (id, data) => {
    try {
      const res = await api.put(`/assets/${id}`, data);
      const assets = get().assets.map(a => a.id === id ? res.data : a);
      set({ assets });
      return res.data;
    } catch (err) {
      console.error('Update asset error:', err);
      throw err;
    }
  },

  requestAsset: async (data) => {
    try {
      const res = await api.post('/assets/transactions', {
        ...data,
        type: 'dispatch'
      });
      set({ transactions: [...get().transactions, res.data] });
      return res.data;
    } catch (err) {
      console.error('Request asset error:', err);
      throw err;
    }
  },

  fetchTransactions: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/assets/transactions?${queryString}`);
      set({ transactions: res.data });
    } catch (err) {
      console.error('Fetch transactions error:', err);
    }
  },

  getAssetByQR: async (qrCode) => {
    try {
      const res = await api.get(`/assets/qr/${qrCode}`);
      return res.data;
    } catch (err) {
      console.error('Get asset by QR error:', err);
      throw err;
    }
  }
}));

export default useAssetStore;
