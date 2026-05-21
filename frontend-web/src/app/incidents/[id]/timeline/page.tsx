import { lazy } from 'react';

const IncidentTimeline = lazy(() => import('@/components/incidents/IncidentTimeline'));

export default function IncidentTimelinePage() {
  return <IncidentTimeline />;
}