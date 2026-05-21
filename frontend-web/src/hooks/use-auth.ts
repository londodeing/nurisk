import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { client } from '@nurisk/sdk';
import type { RegisterRequest } from '@/stores/auth-store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isVolunteer = useAuthStore((s) => s.isVolunteer);
  const isPublic = useAuthStore((s) => s.isPublic);
  const isRole = useAuthStore((s) => s.isRole);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin: isAdmin(),
    isVolunteer: isVolunteer(),
    isPublic: isPublic(),
    isRole,
    updateProfile,
  };
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (_data, _variables) => {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/dashboard';
      navigate(redirectTo);
    },
    onError: (error: Error) => {
      throw error;
    },
  });
}

export function useRegister() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      throw error;
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);
}

export function useRequireAuth(redirectTo = '/login') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const search = window.location.search;
      const redirect = currentPath !== '/login' && currentPath !== '/register'
        ? `?redirect=${encodeURIComponent(currentPath + search)}`
        : '';
      navigate(`${redirectTo}${redirect}`, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(roles: string[], redirectTo = '/dashboard') {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const hasRole = isAuthenticated && user && roles.includes(user.role);

  useEffect(() => {
    if (isAuthenticated && user && !roles.includes(user.role)) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, roles, navigate, redirectTo]);

  return { hasRole: !!hasRole, user };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, phone }: { email: string; phone: string }) =>
      client.post('/auth/register/otp', { email, phone }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, phone, otp }: { email: string; phone: string; otp: string }) =>
      client.post('/auth/register/verify', { email, phone, otp }),
  });
}
