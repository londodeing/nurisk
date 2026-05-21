/**
 * Command Center Page
 * Tactical command dashboard for COMMANDER role
 */

import { redirect } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import CommandLayout from '@/components/command/CommandLayout';

export default function CommandCenterPage() {
  const { user } = useAuthStore();

  // Role check - only COMMANDER and SUPER_ADMIN can access
  const isCommander = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isCommander) {
    redirect('/dashboard');
  }

  return <CommandLayout />;
}