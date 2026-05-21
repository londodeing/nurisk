import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Image, FileText,
  CheckCircle, AlertTriangle, ArrowLeft,
  Users, Shield, Activity
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdkClient } from '@/services/api';
import { useIncident } from '@/features/incidents/hooks/useIncident';
import { useToast } from '@/hooks/use-toast';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import type { Incident, IncidentStatus, DisasterType } from '@nurisk/shared-types/incident';

// Canonical status flow
const statusFlow: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'REPORTED', label: 'Dilaporkan', color: 'red' },
  { value: 'ASSIGNED', label: 'Ditugaskan', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Dalam Proses', color: 'amber' },
  { value: 'RESOLVED', label: 'Diselesaikan', color: 'green' },
  { value: 'CLOSED', label: 'Ditutup', color: 'gray' },
];

// Canonical disaster type labels
const typeLabels: Record<DisasterType, string> = {
  BANJIR: 'Banjir',
  LONGSOR: 'Tanah Longsor',
  GEMPA: 'Gempa Bumi',
  TSUNAMI: 'Tsunami',
  VOLKANO: 'Erupsi Gunung Api',
  KEBAKARAN_HUTAN: 'Kebakaran Hutan',
  KEBAKARAN_BANGUNAN: 'Kebakaran Bangunan',
  EKSTREM_CUACA: 'Ekstrem Cuaca',
  WABAH_PENYAKIT: 'Wabah Penyakit',
};

// Presentation-only view model (includes frontend-only fields)
interface IncidentDetailViewModel {
  incident: Incident;
  photos: string[];
  reporterPhone?: string;
}

export function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  // Fetch incident
  const { data: incident, isLoading } = useIncident(id);

  // Extract frontend-only fields (not part of canonical)
  const viewModel: IncidentDetailViewModel | null = incident ? {
    incident,
    photos: (incident as unknown as { photos?: string[] }).photos ?? [],
    reporterPhone: (incident as unknown as { reporterPhone?: string }).reporterPhone,
  } : null;

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async (newStatus: IncidentStatus) => {
      const res = await sdkClient.patch(`/incidents/${id}`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      toast({ title: 'Status updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'detail', id] });
    },
    onError: () => {
      toast({ title: 'Gagal update status', variant: 'destructive' });
    },
    onSettled: () => {
      setUpdating(false);
    },
  });

  // Verify incident mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      await sdkClient.post(`/incidents/${id}/verify`);
    },
    onSuccess: () => {
      toast({ title: 'Incident diverifikasi', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
  });

  const handleStatusChange = useCallback((newStatus: IncidentStatus) => {
    setUpdating(true);
    updateStatus.mutate(newStatus);
  }, [updateStatus]);

  const handleVerify = useCallback(() => {
    verifyMutation.mutate();
  }, [verifyMutation]);

  const getCurrentStatusIndex = () => {
    if (!incident) return 0;
    return statusFlow.findIndex(s => s.value === incident.status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-nu-green border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <p>Incident tidak ditemukan</p>
        <Button className="mt-4" onClick={() => navigate('/incidents')}>
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  const statusIndex = getCurrentStatusIndex();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Detail Incident</h1>
              <p className="text-sm opacity-80">#{incident.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/incidents/${id}/timeline`)}>
              Timeline
            </Button>
            <Button variant="outline" onClick={() => navigate(`/incidents/${id}/edit`)}>
              Edit
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-4">
        {/* Status Flow */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {statusFlow.map((status, index) => (
                <div key={status.value} className="flex items-center">
                  <button
                    onClick={() => handleStatusChange(status.value)}
                    disabled={updating || index > statusIndex + 1}
                    className={`flex flex-col items-center p-2 rounded transition-colors ${
                      index === statusIndex
                        ? 'bg-nu-green text-white'
                        : index < statusIndex
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mb-1" />
                    <span className="text-xs">{status.label}</span>
                  </button>
                  {index < statusFlow.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      index < statusIndex ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{incident.title}</CardTitle>
                <IncidentStatusBadge status={incident.status} severity={incident.severity} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Jenis</p>
                  <p className="font-medium">{typeLabels[incident.type as DisasterType] || incident.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Severity</p>
                  <p className="font-medium">{incident.severity}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Lokasi</p>
                <p className="font-medium">{incident.location.address ?? '-'}</p>
                {incident.location.lat && incident.location.lng && (
                  <p className="text-sm text-slate-500">
                    {incident.location.lat}, {incident.location.lng}
                  </p>
                )}
              </div>

              {incident.description && (
                <div>
                  <p className="text-sm text-slate-500">Deskripsi</p>
                  <p>{incident.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-slate-500">Pelapor</p>
                  <p className="font-medium">{incident.reportedByName ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal</p>
                  <p className="font-medium">
                    {new Date(incident.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incident.status === 'REPORTED' && (
                <Button onClick={handleVerify} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verifikasi Incident
                </Button>
              )}
              {incident.status === 'ASSIGNED' && (
                <Button onClick={() => handleStatusChange('IN_PROGRESS')} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Mulai Penilaian
                </Button>
              )}
              {incident.status === 'IN_PROGRESS' && (
                <Button onClick={() => handleStatusChange('RESOLVED')} className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Tandai Selesai
                </Button>
              )}
              {incident.status === 'RESOLVED' && (
                <Button onClick={() => handleStatusChange('CLOSED')} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tutup Incident
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Assign Relawan
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Tambah Assessment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Photos (frontend-only) */}
        {viewModel?.photos && viewModel.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="w-5 h-5" />
                Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {viewModel.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Resources */}
        {incident.assignedTo && incident.assignedTo.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tim Ditugaskan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incident.assignedTo.map((volunteer, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>{volunteer}</span>
                    <Button size="sm" variant="ghost">Hubungi</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default IncidentDetail;