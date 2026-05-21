import { lazy } from 'react';

const AdminDashboard = lazy(() => import('@/components/dashboard/AdminDashboard'));

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}