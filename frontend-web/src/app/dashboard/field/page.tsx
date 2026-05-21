import { lazy } from 'react';

const FieldStaffDashboard = lazy(() => import('@/components/dashboard/FieldStaffDashboard'));

export default function FieldDashboardPage() {
  return <FieldStaffDashboard />;
}