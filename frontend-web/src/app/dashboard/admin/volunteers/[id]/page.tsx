import { useParams } from 'react-router-dom';
import { VolunteerDetail as VolunteerDetailComponent } from '@/components/volunteers/VolunteerDetail';

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">ID relawan tidak valid</p>
      </div>
    );
  }

  return <VolunteerDetailComponent />;
}