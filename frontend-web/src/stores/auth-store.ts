import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginRequest, RegisterRequest, User } from '@nurisk/shared-types';
import { client } from '@nurisk/sdk';

// Re-export for backward compatibility
export type { LoginRequest, RegisterRequest, User };

// Frontend-specific User type (extends shared with local fields)
export interface FrontendUser extends User {
  nik?: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: FrontendUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<FrontendUser>) => Promise<void>;
  setUser: (user: FrontendUser | null) => void;
  isRole: (role: User['role']) => boolean;
  isAdmin: () => boolean;
  isVolunteer: () => boolean;
  isPublic: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await client.post<{ token: string; user: FrontendUser }>('/auth/login', { email, password });
          const { token, user } = res;

          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const res = await client.post<{ token: string; user: FrontendUser }>('/auth/register', data);
          const { token, user } = res;

          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const res = await client.post<{ token: string; user: FrontendUser }>('/auth/refresh');
          const { token, user } = res;

          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({ user, token, isAuthenticated: true });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      updateProfile: async (data: Partial<FrontendUser>) => {
        try {
          const user = await client.patch<FrontendUser>('/auth/profile', data);

          localStorage.setItem('user', JSON.stringify(user));
          set({ user });
        } catch (error) {
          throw error;
        }
      },

      setUser: (user: FrontendUser | null) => {
        set({ user, isAuthenticated: !!user });
      },

      isRole: (role: User['role']) => get().user?.role === role,

      isAdmin: () => {
        const role = get().user?.role;
        return role === 'SUPER_ADMIN' || role === 'ADMIN_PWNU' || role === 'ADMIN_PCNU';
      },

      isVolunteer: () => {
        const role = get().user?.role;
        return role === 'RELAWAN' || role === 'FIELD_STAFF' || role === 'STAFF_PWNU' || role === 'STAFF_PCNU';
      },

      isPublic: () => get().user?.role === 'PUBLIC',
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// SDK client handles auth interceptors internally
// No custom interceptor setup needed - SDK manages token refresh

export default useAuthStore;
