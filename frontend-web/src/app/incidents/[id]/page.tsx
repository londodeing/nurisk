import { lazy } from 'react';

const IncidentDetail = lazy(() => import('@/components/incidents/IncidentDetail'));

export default function IncidentDetailPage() {
  return <IncidentDetail />;
}