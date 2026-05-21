import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BuildingAssessmentForm } from '@/components/forms/BuildingAssessmentForm';

export default function BuildingAssessmentPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardContent className="p-6">
            <BuildingAssessmentForm incidentId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}