import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io } from 'socket.io-client';
import type { Incident, IncidentFilter } from '@nurisk/shared-types/incident';

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface IncidentState {
  // Data
  incidents: Incident[];
  selectedIncident: Incident | null;
  
  // Filters & Pagination
  filters: IncidentFilter;
  pagination: Pagination;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Real-time
  socket: ReturnType<typeof io> | null;
  
  // Actions
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (incident: Incident) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setFilters: (filters: IncidentFilter) => void;
  setPagination: (pagination: Partial<Pagination>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Real-time actions
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateIncidentFromSocket: (incident: Incident) => void;
}

export const useIncidentStore = create<IncidentState>()(
  persist(
    (set, get) => ({
      incidents: [],
      selectedIncident: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 0 },
      isLoading: false,
      error: null,
      socket: null,

      setIncidents: (incidents) => set({ incidents }),
      
      addIncident: (incident) => set((state) => ({ 
        incidents: [incident, ...state.incidents] 
      })),
      
      updateIncident: (incident) => set((state) => ({
        incidents: state.incidents.map(i => 
          i.id === incident.id ? incident : i
        ),
        selectedIncident: state.selectedIncident?.id === incident.id 
          ? incident 
          : state.selectedIncident,
      })),
      
      setSelectedIncident: (incident) => set({ selectedIncident: incident }),
      
      setFilters: (filters) => set({ filters, pagination: { ...get().pagination, page: 1 } }),
      
      setPagination: (pagination) => set({ 
        pagination: { ...get().pagination, ...pagination } 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      connectSocket: () => {
        const { socket } = get();
        if (socket?.connected) return;
        
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:7860', {
          transports: ['websocket'],
        });
        
        newSocket.on('connect', () => {
          console.log('[Socket] Connected');
          newSocket.emit('join:incidents');
        });
        
        newSocket.on('incident:created', (incident: Incident) => {
          const { incidents } = get();
          set({ incidents: [incident, ...incidents] });
        });
        
        newSocket.on('incident:updated', (incident: Incident) => {
          get().updateIncidentFromSocket(incident);
        });
        
        newSocket.on('incident:deleted', (id: string) => {
          const { incidents } = get();
          set({ incidents: incidents.filter(i => i.id !== id) });
        });
        
        set({ socket: newSocket });
      },
      
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null });
        }
      },
      
      updateIncidentFromSocket: (incident: Incident) => {
        const { incidents, selectedIncident } = get();
        
        // Update in list
        const updatedIncidents = incidents.map(i => 
          i.id === incident.id ? incident : i
        );
        
        // Update selected if same
        const updatedSelected = selectedIncident?.id === incident.id 
          ? incident 
          : selectedIncident;
        
        set({ 
          incidents: updatedIncidents, 
          selectedIncident: updatedSelected 
        });
      },
    }),
    {
      name: 'incident-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);

export default useIncidentStore;