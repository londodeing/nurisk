import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import api from '@/services/api';

interface PanicButtonProps {
  position?: 'fixed' | 'absolute';
  bottom?: string;
  right?: string;
  size?: 'sm' | 'md' | 'lg';
  onPanic?: (incidentId: string) => void;
}

const sizes = {
  sm: 'w-16 h-16 text-sm',
  md: 'w-24 h-24 text-lg',
  lg: 'w-32 h-32 text-xl',
};

export default function PanicButton({ 
  position = 'fixed', 
  bottom = '24px', 
  right = '24px',
  size = 'md',
  onPanic,
}: PanicButtonProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get device ID
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }, []);

  // Detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('GPS error:', error)
      );
    }
  }, []);

  const handlePanic = useCallback(async () => {
    setStatus('sending');
    
    try {
      const deviceId = getDeviceId();
      
      // Send panic alert
      const res = await api.post('/incidents/panic', {
        device_id: deviceId,
        latitude: location?.lat,
        longitude: location?.lng,
        timestamp: new Date().toISOString(),
      });
      
      const newIncidentId = res.data.id || res.data.incidentId;
      setIncidentId(newIncidentId);
      setStatus('success');
      onPanic?.(newIncidentId);
      
      // Navigate after 2 seconds
      setTimeout(() => {
        navigate(`/incidents/${newIncidentId}`);
      }, 2000);
    } catch (error) {
      console.error('Panic error:', error);
      setStatus('error');
    }
  }, [getDeviceId, location, navigate, onPanic]);

  if (status === 'success') {
    return (
      <div 
        className={`${position} ${sizes[size]} rounded-full flex flex-col items-center justify-center bg-safe-green text-white z-50`}
        style={{ bottom, right }}
      >
        <CheckCircle className="w-1/2 h-1/2" />
        <span className="text-xs mt-1">TERKIRIM</span>
        {incidentId && (
          <span className="text-xs">ID: {incidentId.slice(0, 8)}</span>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handlePanic}
      disabled={status === 'sending'}
      className={`${position} ${sizes[size]} rounded-full bg-danger-red hover:bg-danger-red/90 text-white font-bold shadow-lg animate-pulse z-50`}
      style={{ bottom, right }}
    >
      {status === 'sending' ? (
        <Loader2 className="w-1/2 h-1/2 animate-spin" />
      ) : (
        <>
          <AlertTriangle className="w-1/2 h-1/2" />
          <span className="mt-1">DARURAT</span>
        </>
      )}
    </Button>
  );
}

// Floating panic button with confirmation
export function FloatingPanicButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleConfirm = async () => {
    try {
      const deviceId = localStorage.getItem('device_id') || `device_${Date.now()}`;
      await api.post('/incidents/panic', {
        device_id: deviceId,
        latitude: location?.lat,
        longitude: location?.lng,
      });
      alert('Panic alert sent! Help is on the way.');
      setShowConfirm(false);
    } catch (error) {
      console.error('Panic error:', error);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed bottom-24 right-6 z-50">
        <div className="bg-white rounded-lg shadow-xl p-4 w-64">
          <p className="font-bold text-danger-red mb-2">Konfirmasi Darurat?</p>
          <p className="text-sm text-slate-600 mb-4">
            Kirim alert darurat ke {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-danger-red">
              Ya, Kirim
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PanicButton 
      size="lg" 
      onPanic={() => {}} 
    />
  );
}

