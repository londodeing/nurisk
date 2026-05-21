import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';

export default function useRefreshToken() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('nurisk_refresh_token') || localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');
      return sdk.auth.refreshToken({ refreshToken });
    },
    onSuccess: (data) => {
      const newToken = (data as any)?.accessToken;
      if (newToken) {
        useAuthStore.getState().setUser(useAuthStore.getState().user);
      }
    },
    onError: () => {
      useAuthStore.getState().logout();
      navigate('/login');
    },
  });
}
