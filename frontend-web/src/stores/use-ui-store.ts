import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface UiState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  emergencyMode: boolean;
  
  // Toast notifications
  toasts: Toast[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setEmergencyMode: (enabled: boolean) => void;
  toggleEmergencyMode: () => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'system',
      emergencyMode: false,
      toasts: [],

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      setEmergencyMode: (enabled) => {
        set({ emergencyMode: enabled });
        applyEmergencyMode(enabled);
      },
      
      toggleEmergencyMode: () => {
        const newValue = !get().emergencyMode;
        set({ emergencyMode: newValue });
        applyEmergencyMode(newValue);
      },
      
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newToast = { ...toast, id };
        
        set({ toasts: [...get().toasts, newToast] });
        
        // Auto-dismiss
        if (toast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration);
        }
      },
      
      removeToast: (id) => {
        set({ toasts: get().toasts.filter(t => t.id !== id) });
      },
      
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        emergencyMode: state.emergencyMode,
      }),
    }
  )
);

// Helper functions
function applyTheme(theme: 'light' | 'dark' | 'system') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

function applyEmergencyMode(enabled: boolean) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (enabled) {
    root.classList.add('emergency-mode');
    // Add emergency CSS variables
    root.style.setProperty('--color-primary', '#dc2626');
    root.style.setProperty('--color-danger', '#ef4444');
  } else {
    root.classList.remove('emergency-mode');
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-danger');
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = useUiStore.getState();
  applyTheme(stored.theme);
  applyEmergencyMode(stored.emergencyMode);
}

// Convenience toast helpers
export const toast = {
  success: (message: string, duration = 3000) => 
    useUiStore.getState().addToast({ message, type: 'success', duration }),
  error: (message: string, duration = 5000) => 
    useUiStore.getState().addToast({ message, type: 'error', duration }),
  warning: (message: string, duration = 4000) => 
    useUiStore.getState().addToast({ message, type: 'warning', duration }),
  info: (message: string, duration = 3000) => 
    useUiStore.getState().addToast({ message, type: 'info', duration }),
};

export default useUiStore;