import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import api from '@/services/api';

type Method = 'email' | 'phone';

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = method === 'email' 
        ? { email } 
        : { phone: phone.replace(/^0/, '+62') };
      
      await api.post('/auth/forgot-password', payload);
      
      setSuccess(true);
      toast({ title: 'Kode dikirim', variant: 'success' });
      
      // Navigate to OTP verification
      setTimeout(() => {
        navigate('/reset-password/verify', { 
          state: { [method]: method === 'email' ? email : phone } 
        });
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim kode';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [method, email, phone, navigate, toast]);

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-safe-green/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-safe-green" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Kode Terkirim</h2>
          <p className="text-slate-600">
            Kami telah mengirim kode verifikasi ke {method === 'email' ? email : phone}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>
          Masukkan {method === 'email' ? 'email' : 'nomor HP'} untuk menerima kode verifikasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Method toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={method === 'email' ? 'default' : 'outline'}
            onClick={() => setMethod('email')}
            className="flex-1"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            type="button"
            variant={method === 'phone' ? 'default' : 'outline'}
            onClick={() => setMethod('phone')}
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-2" />
            HP
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'email' ? (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Kode'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-nu-green hover:underline">
            ← Kembali ke Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}