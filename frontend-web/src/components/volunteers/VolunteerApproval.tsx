import { useState } from 'react';
import {
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import type { Volunteer } from '@nurisk/shared-types/volunteer';
import {
  useUpdateVolunteerStatus,
  VolunteerStatus,
} from '@/hooks/use-volunteers';

interface VolunteerApprovalProps {
  volunteer: Volunteer;
  onSuccess?: () => void;
}

const STATUS_LABELS: Record<VolunteerStatus, string> = {
  ACTIVE: 'Aktif',
  DEPLOYED: 'Diterjunkan',
  ON_DUTY: 'Bertugas',
  OFF_DUTY: 'Libur',
  INACTIVE: 'Tidak Aktif',
};

export function VolunteerApproval({ volunteer, onSuccess }: VolunteerApprovalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const updateStatus = useUpdateVolunteerStatus();
  const location = [volunteer.province, volunteer.regency, volunteer.district]
    .filter(Boolean)
    .join(', ') || '-';

  const handleActivate = async () => {
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync({ id: volunteer.id, status: 'ACTIVE' });
      onSuccess?.();
    } catch (error) {
      console.error('Activation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync({ id: volunteer.id, status: 'INACTIVE' });
      onSuccess?.();
    } catch (error) {
      console.error('Deactivation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isActive = volunteer.status === 'ACTIVE';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Status Relawan
      </h3>

      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{volunteer.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{volunteer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{volunteer.phone || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{location}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <span className="text-sm font-medium text-slate-600">
          Status: {STATUS_LABELS[volunteer.status] ?? volunteer.status}
        </span>
      </div>

      {isActive ? (
        <button
          onClick={handleDeactivate}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Nonaktifkan
        </button>
      ) : (
        <button
          onClick={handleActivate}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Check className="w-4 h-4" />
          Aktifkan
        </button>
      )}
    </div>
  );
}

export default VolunteerApproval;