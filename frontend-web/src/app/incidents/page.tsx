import { lazy } from 'react';

const IncidentList = lazy(() => import('@/components/incidents/IncidentList'));

export default function IncidentsPage() {
  return <IncidentList />;
}