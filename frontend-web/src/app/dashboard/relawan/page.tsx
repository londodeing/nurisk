import { lazy } from 'react';

const RelawanTactical = lazy(() => import('@/components/dashboard/RelawanTactical'));

export default function RelawanDashboardPage() {
  return <RelawanTactical />;
}