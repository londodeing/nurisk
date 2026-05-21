import { create } from 'zustand';
import api from '../services/api';

interface DashboardStats {
  incidents?: {
    total_incidents?: number;
    critical?: number;
    reported?: number;
    verified?: number;
    assessed?: number;
    commanded?: number;
    in_action?: number;
    completed?: number;
  };
  volunteers?: { active?: number };
  assets?: { total_items?: number };
}

interface VolunteerPerf {
  id: string;
  full_name: string;
  expertise: string;
  regency: string;
  missions_completed: number;
  total_hours?: number;
}

interface KPI {
  avgResponseHours?: number;
  newVolunteers?: number;
  assetsDeployed?: number;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  responseMetrics: unknown[];
  incidentsByDimension: unknown[];
  volunteerPerformance: VolunteerPerf[];
  kpis: KPI | null;
  isLoading: boolean;

  setDashboardStats: (stats: DashboardStats | null) => void;
  setResponseMetrics: (metrics: unknown[]) => void;
  setIncidentsByDimension: (data: unknown[]) => void;
  setVolunteerPerformance: (data: VolunteerPerf[]) => void;
  setKPIs: (kpis: KPI | null) => void;
  setLoading: (loading: boolean) => void;

  fetchDashboardStats: (params?: Record<string, string>) => Promise<void>;
  fetchResponseMetrics: (startDate: string, endDate: string) => Promise<void>;
  fetchIncidentsByDimension: (dimension: string, startDate: string, endDate: string) => Promise<void>;
  fetchVolunteerPerformance: (region?: string) => Promise<void>;
  fetchKPIs: (year?: number, month?: string) => Promise<void>;
  downloadSITREP: (incidentId: string) => Promise<void>;
  uploadMedia: (file: File, incidentId?: string, type?: string) => Promise<unknown>;
  getMedia: (incidentId: string) => Promise<unknown[]>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  dashboardStats: null,
  responseMetrics: [],
  incidentsByDimension: [],
  volunteerPerformance: [],
  kpis: null,
  isLoading: false,

  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setResponseMetrics: (metrics) => set({ responseMetrics: metrics }),
  setIncidentsByDimension: (data) => set({ incidentsByDimension: data }),
  setVolunteerPerformance: (data) => set({ volunteerPerformance: data }),
  setKPIs: (kpis) => set({ kpis }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchDashboardStats: async (params = {}) => {
    set({ isLoading: true });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/analytics/dashboard?${queryString}`);
      set({ dashboardStats: res.data });
    } catch (err) {
      console.error('Fetch dashboard stats error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchResponseMetrics: async (startDate, endDate) => {
    try {
      const res = await api.get(`/analytics/response-metrics?start_date=${startDate}&end_date=${endDate}`);
      set({ responseMetrics: res.data });
    } catch (err) {
      console.error('Fetch response metrics error:', err);
    }
  },

  fetchIncidentsByDimension: async (dimension, startDate, endDate) => {
    try {
      const res = await api.get(`/analytics/incidents-by?dimension=${dimension}&start_date=${startDate}&end_date=${endDate}`);
      set({ incidentsByDimension: res.data });
    } catch (err) {
      console.error('Fetch incidents by dimension error:', err);
    }
  },

  fetchVolunteerPerformance: async (region) => {
    try {
      const res = await api.get(`/analytics/volunteers/performance?region=${region || ''}`);
      set({ volunteerPerformance: res.data });
    } catch (err) {
      console.error('Fetch volunteer performance error:', err);
    }
  },

  fetchKPIs: async (year, month) => {
    try {
      const res = await api.get(`/analytics/kpis?year=${year || new Date().getFullYear()}&month=${month || ''}`);
      set({ kpis: res.data });
    } catch (err) {
      console.error('Fetch KPIs error:', err);
    }
  },

  downloadSITREP: async (incidentId) => {
    try {
      const res = await api.get(`/analytics/incidents/${incidentId}/sitrep`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SITREP_INC-${incidentId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download SITREP error:', err);
      throw err;
    }
  },

  uploadMedia: async (file, incidentId, type = 'photo') => {
    const formData = new FormData();
    formData.append('file', file);
    if (incidentId) formData.append('incident_id', incidentId.toString());
    formData.append('type', type);

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.error('Upload media error:', err);
      throw err;
    }
  },

  getMedia: async (incidentId) => {
    try {
      const res = await api.get(`/reports/media/${incidentId}`);
      return res.data;
    } catch (err) {
      console.error('Get media error:', err);
      return [];
    }
  }
}));

export default useAnalyticsStore;
