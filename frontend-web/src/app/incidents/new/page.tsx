import { lazy } from 'react';

const IncidentForm = lazy(() => import('@/components/incidents/IncidentForm'));

export default function NewIncidentPage() {
  return <IncidentForm />;
}