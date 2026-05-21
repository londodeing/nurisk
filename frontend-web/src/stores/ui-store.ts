import { create } from 'zustand';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface UIState {
  // === State ===
  // Sidebar
  sidebarOpen: boolean;
  
  // Modal
  activeModal: string | null;
  modalData: unknown | null;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Mobile Menu
  mobileMenuOpen: boolean;
  
  // Toast Queue
  toasts: Toast[];

  // === Actions ===
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal actions
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Mobile menu actions
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  // === Initial State ===
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  theme: 'light',
  mobileMenuOpen: false,
  toasts: [],

  // === Sidebar Actions ===
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // === Modal Actions ===
  openModal: (modalId, data = null) => set({ 
    activeModal: modalId, 
    modalData: data 
  }),
  
  closeModal: () => set({ 
    activeModal: null, 
    modalData: null 
  }),

  // === Theme Actions ===
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    applyTheme(newTheme);
  },

  // === Mobile Menu Actions ===
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
  
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // === Toast Actions ===
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { 
      ...toast, 
      id,
      duration: toast.duration ?? 3000,
    };
    
    set({ toasts: [...get().toasts, newToast] });
    
    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
  
  clearToasts: () => set({ toasts: [] }),
}));

// === Helper Functions ===
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// === Toast Convenience Helpers ===
export const toast = {
  success: (message: string, title?: string, duration = 3000) => 
    useUIStore.getState().addToast({ message, title, variant: 'success', duration }),
  
  error: (message: string, title?: string, duration = 5000) => 
    useUIStore.getState().addToast({ message, title, variant: 'destructive', duration }),
  
  default: (message: string, title?: string, duration = 3000) => 
    useUIStore.getState().addToast({ message, title, variant: 'default', duration }),
};

// === Initialize Theme ===
if (typeof window !== 'undefined') {
  const { theme } = useUIStore.getState();
  applyTheme(theme);
}

export default useUIStore;