import { useAuthStore as authStore } from '@/stores/auth-store';
import type { User, LoginRequest, RegisterRequest, AuthState } from '@/stores/auth-store';

export const useAuthStore = authStore;
export type { User, LoginRequest, RegisterRequest, AuthState };
export default authStore;
