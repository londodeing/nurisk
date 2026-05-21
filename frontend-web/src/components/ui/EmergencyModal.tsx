import { useState, useEffect } from 'react';
import { AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyData {
  title: string;
  message: string;
  roles: string[];
}

export default function EmergencyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<EmergencyData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handleEmergency = (e: CustomEvent<EmergencyData>) => {
      setData(e.detail);
      setIsOpen(true);
    };

    window.addEventListener('emergency:alert', handleEmergency as EventListener);
    return () => {
      window.removeEventListener('emergency:alert', handleEmergency as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-danger-red text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold">{data.title}</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-lg mb-4">{data.message}</p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 text-slate-600"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span className="text-sm">
                {soundEnabled ? 'Suara nyala' : 'Suara mati'}
              </span>
            </button>
            
            <Button onClick={handleClose}>
              Saya Mengerti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}