import { Link, useParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { useVolunteer } from '@/features/volunteers/hooks/useVolunteer';
import type { Volunteer } from '@nurisk/shared-types/volunteer';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Aktif', color: 'text-green-600', bg: 'bg-green-50' },
  DEPLOYED: { label: 'Diterjunkan', color: 'text-blue-600', bg: 'bg-blue-50' },
  ON_DUTY: { label: 'Bertugas', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  OFF_DUTY: { label: 'Libur', color: 'text-slate-500', bg: 'bg-slate-50' },
  INACTIVE: { label: 'Tidak Aktif', color: 'text-red-600', bg: 'bg-red-50' },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  RELAWAN_PBNU: { label: 'Relawan PBNU', color: 'text-green-600' },
  RELAWAN_PCNU: { label: 'Relawan PCNU', color: 'text-blue-600' },
  RELAWAN_CABANG: { label: 'Relawan Cabang', color: 'text-purple-600' },
  RELAWAN_DESA: { label: 'Relawan Desa', color: 'text-orange-600' },
};

function ProfileTab({ volunteer }: { volunteer: Volunteer }) {
  const statusConfig = STATUS_CONFIG[volunteer.status] ?? STATUS_CONFIG.INACTIVE!;
  const typeConfig = TYPE_CONFIG[volunteer.type] ?? TYPE_CONFIG.RELAWAN_DESA!;
  const location = [volunteer.province, volunteer.regency, volunteer.district]
    .filter(Boolean)
    .join(', ') || '-';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="w-10 h-10 text-slate-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-700">{volunteer.name}</h2>
            <p className={cn('text-sm font-medium mt-1', typeConfig.color)}>
              {typeConfig.label}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span
                className={cn(
                  'inline-flex px-3 py-1 rounded-full text-sm font-medium',
                  statusConfig.color,
                  statusConfig.bg
                )}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Informasi Kontak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-slate-700">{volunteer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Telepon</p>
              <p className="text-slate-700">{volunteer.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Lokasi</p>
              <p className="text-slate-700">{location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Bergabung</p>
              <p className="text-slate-700">
                {volunteer.joinedAt
                  ? new Date(volunteer.joinedAt).toLocaleDateString('id-ID')
                  : new Date(volunteer.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Total Misi</p>
              <p className="text-slate-700">{volunteer.totalMissions}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Total Jam</p>
              <p className="text-slate-700">{volunteer.totalHours} jam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VolunteerDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: volunteer, isLoading } = useVolunteer(id!);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Relawan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/dashboard/admin/volunteers"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Daftar</span>
      </Link>

      <ProfileTab volunteer={volunteer} />
    </div>
  );
}

export default VolunteerDetail;