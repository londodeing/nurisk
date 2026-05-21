import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';

export default function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => sdk.auth.logout(),
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });
}
