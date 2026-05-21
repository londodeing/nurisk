import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginRequest } from '@nurisk/shared-types';

export default function useLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => sdk.auth.login(credentials),
    onSuccess: (data) => {
      const user = (data as any)?.user;
      if (user) {
        setUser(user);
      }
      navigate('/dashboard');
    },
  });
}
