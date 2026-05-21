import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '@/services/api';

type Step = 'identity' | 'contact' | 'verification';

interface RegisterData {
  name: string;
  nik: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('identity');
  const [data, setData] = useState<RegisterData>({
    name: '',
    nik: '',
    birthDate: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Validation
  const validateNik = (nik: string) => /^\d{16}$/.test(nik);
  const validatePhone = (phone: string) => /^(\+62|62|0)\d{9,12}$/.test(phone.replace(/\D/g, ''));
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNext = useCallback(() => {
    setError('');
    
    if (step === 'identity') {
      if (!data.name.trim()) {
        setError('Nama lengkap wajib diisi');
        return;
      }
      if (!validateNik(data.nik)) {
        setError('NIK harus 16 digit');
        return;
      }
      if (!data.birthDate) {
        setError('Tanggal lahir wajib diisi');
        return;
      }
      setStep('contact');
    } else if (step === 'contact') {
      if (!validateEmail(data.email)) {
        setError('Email tidak valid');
        return;
      }
      if (!validatePhone(data.phone)) {
        setError('Nomor HP tidak valid');
        return;
      }
      if (data.password.length < 8) {
        setError('Password minimal 8 karakter');
        return;
      }
      if (data.password !== data.confirmPassword) {
        setError('Password tidak cocok');
        return;
      }
      setStep('verification');
    }
  }, [step, data]);

  const handleBack = useCallback(() => {
    if (step === 'contact') setStep('identity');
    else if (step === 'verification') setStep('contact');
  }, [step]);

  const handleSendOtp = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/register/otp', {
        email: data.email,
        phone: data.phone.replace(/^0/, '+62'),
      });
      toast({ title: 'OTP dikirim', description: 'Kode verifikasi dikirim ke email/HP', variant: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim OTP';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [data.email, data.phone, toast]);

  const handleVerifyAndRegister = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Verify OTP
      await api.post('/auth/register/verify', {
        email: data.email,
        phone: data.phone.replace(/^0/, '+62'),
        otp,
      });
      
      // Complete registration
      await api.post('/auth/register', {
        name: data.name,
        nik: data.nik,
        birthDate: data.birthDate,
        email: data.email,
        phone: data.phone.replace(/^0/, '+62'),
        password: data.password,
      });
      
      toast({ title: 'Pendaftaran berhasil', variant: 'success' });
      navigate('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verifikasi gagal';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, otp, navigate, toast]);

  const renderStep = () => {
    switch (step) {
      case 'identity':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Nama sesuai KTP"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nik">NIK (16 digit)</Label>
              <Input
                id="nik"
                placeholder="3324010101990001"
                value={data.nik}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  nik: e.target.value.replace(/\D/g, '').slice(0, 16) 
                }))}
                maxLength={16}
                required
              />
              {data.nik.length > 0 && (
                <p className={`text-xs mt-1 ${data.nik.length === 16 ? 'text-safe-green' : 'text-danger-red'}`}>
                  {data.nik.length}/16 digit
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="birthDate">Tanggal Lahir</Label>
              <Input
                id="birthDate"
                type="date"
                value={data.birthDate}
                onChange={(e) => setData(prev => ({ ...prev, birthDate: e.target.value }))}
                required
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="081234567890"
                value={data.phone}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  phone: e.target.value.replace(/\D/g, '').slice(0, 12) 
                }))}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Contoh: 081234567890</p>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={data.password}
                onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Masukkan ulang password"
                value={data.confirmPassword}
                onChange={(e) => setData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              {data.confirmPassword && data.password !== data.confirmPassword && (
                <p className="text-xs text-danger-red mt-1">Password tidak cocok</p>
              )}
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-nu-green mb-2" />
              <p className="text-sm text-slate-600">
                Kami telah mengirim kode verifikasi ke:
              </p>
              <p className="font-medium">{data.email}</p>
              <p className="font-medium">{data.phone}</p>
            </div>
            
            <div>
              <Label htmlFor="otp">Kode OTP (6 digit)</Label>
              <Input
                id="otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Ulang OTP'}
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Daftar</CardTitle>
        <CardDescription>
          {step === 'identity' && 'Langkah 1: Identitas Diri'}
          {step === 'contact' && 'Langkah 2: Kontak & Password'}
          {step === 'verification' && 'Langkah 3: Verifikasi'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {['identity', 'contact', 'verification'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === s ? 'bg-nu-green text-white' : 
                ['identity', 'contact', 'verification'].indexOf(step) > i ? 'bg-nu-green/50' : 'bg-slate-200'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderStep()}

        <div className="flex justify-between mt-6">
          {step !== 'identity' && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          )}
          {step !== 'verification' ? (
            <Button onClick={handleNext} className="ml-auto">
              Lanjut
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleVerifyAndRegister} className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-nu-green hover:underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}