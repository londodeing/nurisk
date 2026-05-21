import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, CheckCircle, Play, Coffee, Bell, RefreshCw, Navigation,
  Target, Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';
import type { Mission } from '@nurisk/shared-types/mission';

// Types
type VolunteerStatus = 'available' | 'on_mission' | 'on_break';

interface MyMission {
  id: string;
  missionId: string;
  name: string;
  location: { address?: string };
  status: 'assigned' | 'en_route' | 'on_site' | 'completed';
  assignedAt: string;
}

// Status Update Bar
function StatusUpdateBar({ 
  status, 
  onStatusChange 
}: { 
  status: VolunteerStatus;
  onStatusChange: (status: VolunteerStatus) => void;
}) {
  const statusOptions = [
    { value: 'available', label: 'Tersedia', icon: CheckCircle, color: 'bg-green-500' },
    { value: 'on_mission', label: 'Ditugaskan', icon: Play, color: 'bg-blue-500' },
    { value: 'on_break', label: 'Istirahat', icon: Coffee, color: 'bg-amber-500' },
  ] as const;

  return (
    <div className="bg-white border-b p-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <div className="flex gap-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  status === option.value 
                    ? `${option.color} text-white` 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Mission Card
function MissionCard({ 
  mission, 
  onJoin,
  joining 
}: { 
  mission: Mission;
  onJoin: (id: string) => void;
  joining?: boolean;
}) {
  const priorityColors = {
    CRITICAL: 'border-red-500 bg-red-50',
    HIGH: 'border-orange-500 bg-orange-50',
    MEDIUM: 'border-yellow-500 bg-yellow-50',
    LOW: 'border-green-500 bg-green-50',
  };

  const spotsLeft = (mission.volunteersNeeded ?? 0) - (mission.volunteersJoined ?? 0);
  const isFull = spotsLeft <= 0;

  return (
    <Card className={`border-l-4 ${priorityColors[mission.priority] || priorityColors.LOW}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{mission.name}</h4>
            <p className="text-xs text-slate-500 truncate">{mission.location?.address ?? 'Lokasi tidak tersedia'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {mission.priority}
              </Badge>
              <span className="text-xs text-slate-500">
                {spotsLeft} slot tersisa
              </span>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => onJoin(mission.id)}
            disabled={isFull || joining}
          >
            {joining ? '...' : 'Gabung'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mission List
function MissionList({ 
  missions, 
  loading, 
  onJoin,
  joiningId 
}: { 
  missions: Mission[];
  loading: boolean;
  onJoin: (id: string) => void;
  joiningId?: string;
}) {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Missions
          <Badge variant="destructive" className="ml-auto">
            {missions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : missions.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm text-center">
            Tidak ada mission tersedia
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onJoin={onJoin}
                joining={joiningId === mission.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// My Missions
function MyMissions({ 
  missions, 
  loading,
  onNavigate 
}: { 
  missions: MyMission[];
  loading: boolean;
  onNavigate: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          My Missions
          <Badge variant="outline" className="ml-auto">
            {missions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : missions.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            Belum ada mission
          </div>
        ) : (
          <div className="space-y-2">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center justify-between p-2 rounded bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{mission.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{mission.status.replace('_', ' ')}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onNavigate(mission.missionId)}>
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mini Map Component
function MiniMap({ missions, onSelect }: { missions: Mission[]; onSelect: (id: string) => void }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Tactical Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 bg-slate-100 rounded relative overflow-hidden">
          {/* Simplified map - in production would use Leaflet */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-100 to-slate-50" />
          </div>
          {missions.slice(0, 15).map((mission, i) => (
            <button
              key={mission.id}
              onClick={() => onSelect(mission.id)}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 ${
                mission.priority === 'CRITICAL' ? 'bg-red-500' :
                mission.priority === 'HIGH' ? 'bg-orange-500' :
                mission.priority === 'MEDIUM' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{
                left: `${10 + (i * 6)}%`,
                top: `${15 + (i * 5)}%`,
              }}
              title={mission.name}
            />
          ))}
          <div className="absolute bottom-2 right-2 flex gap-2 text-xs">
            <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Kritis
            </span>
            <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Tinggi
            </span>
            <span className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Sedang
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function RelawanTactical() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [status, setStatus] = useState<VolunteerStatus>('available');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch available missions
  const { data: missions = [], isLoading: missionsLoading, refetch: refetchMissions } = useQuery({
    queryKey: ['available-missions'],
    queryFn: async () => {
      const res = await api.get('/missions/available');
      return res.data.data || [];
    },
  });

  // Fetch my missions
  const { data: myMissions = [], isLoading: myMissionsLoading } = useQuery({
    queryKey: ['my-missions'],
    queryFn: async () => {
      const res = await api.get('/volunteer/deployments');
      return res.data.data || [];
    },
  });

  // Join mission mutation
  const joinMission = useMutation({
    mutationFn: async (missionId: string) => {
      await api.post(`/missions/${missionId}/join`);
    },
    onSuccess: () => {
      toast({ title: 'Berhasil join mission', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['available-missions'] });
      queryClient.invalidateQueries({ queryKey: ['my-missions'] });
    },
    onError: () => {
      toast({ title: 'Gagal join mission', variant: 'destructive' });
    },
    onSettled: () => {
      setJoiningId(null);
    },
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      await api.patch('/volunteer/status', { status: newStatus });
    },
    onSuccess: () => {
      toast({ title: 'Status updated', variant: 'success' });
    },
  });

  // Handle status change
  const handleStatusChange = useCallback((newStatus: VolunteerStatus) => {
    setStatus(newStatus);
    updateStatus.mutate(newStatus);
  }, [updateStatus]);

  // Handle join mission
  const handleJoin = useCallback((missionId: string) => {
    setJoiningId(missionId);
    joinMission.mutate(missionId);
  }, [joinMission]);

  // Handle select mission
  const handleSelectMission = useCallback((missionId: string) => {
    // Scroll to mission in list or open detail
    navigate(`/missions/${missionId}`);
  }, [navigate]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('mission:new', (mission: Mission) => {
      setNotification(`Mission baru: ${mission.name}`);
      refetchMissions();
    });

    socket.on('mission:urgent', (data: { message: string }) => {
      setNotification(data.message);
    });

    return () => {
      socket.off('mission:new');
      socket.off('mission:urgent');
    };
  }, [socket, refetchMissions]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Banner */}
      {notification && (
        <div className="bg-red-600 text-white p-3 flex items-center justify-center gap-2 animate-pulse">
          <Bell className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-nu-green text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Tactical Dashboard</h1>
            <p className="text-sm opacity-80">Relawan NU Disaster Response</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetchMissions()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="sm">Profil</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <StatusUpdateBar status={status} onStatusChange={handleStatusChange} />

      <main className="container mx-auto p-4 space-y-4">
        {/* Map and Mission List */}
        <div className="grid md:grid-cols-3 gap-4">
          <MiniMap missions={missions} onSelect={handleSelectMission} />
          <MissionList 
            missions={missions}
            loading={missionsLoading}
            onJoin={handleJoin}
            joiningId={joiningId || undefined}
          />
        </div>

        {/* My Missions */}
        <MyMissions
          missions={myMissions}
          loading={myMissionsLoading}
          onNavigate={handleSelectMission}
        />
      </main>
    </div>
  );
}