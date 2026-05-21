import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useCreateIncident } from '@/hooks/use-incidents';

interface EmergencyReportFormProps {
  onSuccess?: (incidentId: string) => void;
}

export default function EmergencyReportForm({ onSuccess }: EmergencyReportFormProps) {
  const navigate = useNavigate();
  const createIncident = useCreateIncident();
  
  const [formData, setFormData] = useState({
    type: 'other',
    title: 'DARURAT',
    description: '',
    location: '',
    latitude: -7.5755,
    longitude: 110.8243,
    severity: 'CRITICAL',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationStatus('success');
        },
        (error) => {
          console.error('GPS error:', error);
          setLocationStatus('error');
        }
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await createIncident.mutateAsync({
        type: formData.type as any,
        title: formData.title,
        description: formData.description || 'Laporan darurat via one-tap',
        location: { lat: formData.latitude, lng: formData.longitude },
        severity: formData.severity as any,
      });
      
      onSuccess?.(result.id);
      navigate(`/incidents/${result.id}`);
    } catch (error) {
      console.error('Emergency report error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createIncident, navigate, onSuccess]);

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        {/* Emergency header */}
        <div className="flex items-center gap-2 text-danger-red mb-4">
          <AlertTriangle className="w-6 h-6" />
          <span className="font-bold text-lg">LAPORAN DARURAT</span>
        </div>

        {/* Location status */}
        <div className="flex items-center gap-2">
          <MapPin className={`w-5 h-5 ${
            locationStatus === 'loading' ? 'animate-pulse text-warning-yellow' :
            locationStatus === 'success' ? 'text-safe-green' :
            'text-danger-red'
          }`} />
          <span className="text-sm">
            {locationStatus === 'loading' && 'Mendeteksi lokasi...'}
            {locationStatus === 'success' && `Lokasi: ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`}
            {locationStatus === 'error' && 'Lokasi tidak tersedia'}
          </span>
        </div>

        {/* Minimal form - just description */}
        <div>
          <Label>Deskripsi Singkat</Label>
          <Input
            placeholder="Apa yang terjadi?"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Submit button */}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-danger-red hover:bg-danger-red/90 text-lg py-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 mr-2" />
              KIRIM DARURAT SEKARANG
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Laporan ini akan ditandai prioritas tinggi
        </p>
      </CardContent>
    </Card>
  );
}