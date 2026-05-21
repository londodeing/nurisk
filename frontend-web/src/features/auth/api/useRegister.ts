import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import type { RegisterRequest } from '@nurisk/shared-types';

export default function useRegister() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => sdk.auth.register(data),
    onSuccess: (data) => {
      const user = (data as any)?.user;
      if (user) {
        setUser(user);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    },
  });
}
