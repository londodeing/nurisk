import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import api from '@/services/api';

export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitRef = useRef<() => void>();
  
  const email = location.state?.email as string | undefined;
  const phone = location.state?.phone as string | undefined;

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '').slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleResend = useCallback(async () => {
    setCountdown(60);
    try {
      const payload = email ? { email } : { phone: phone?.replace(/^0/, '+62') };
      await api.post('/auth/forgot-password', payload);
      toast({ title: 'OTP dikirim ulang', variant: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim OTP';
      setError(message);
    }
  }, [email, phone, toast]);

  const handleSubmit = useCallback(async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = email 
        ? { email, otp: otpCode } 
        : { phone: phone?.replace(/^0/, '+62'), otp: otpCode };
      
      await api.post('/auth/reset-password/verify', payload);
      
      toast({ title: 'Verifikasi berhasil', variant: 'success' });
      navigate('/reset-password/new', { state: { email, phone } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kode salah atau expired';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, email, phone, navigate, toast]);

  // Store handleSubmit ref for auto-submit
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.join('').length === 6 && !isSubmitting && submitRef.current) {
      const timer = setTimeout(() => submitRef.current?.(), 300);
      return () => clearTimeout(timer);
    }
  }, [otp, isSubmitting]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Verifikasi Kode</CardTitle>
        <CardDescription>
          Masukkan kode yang dikirim ke<br />
          <span className="font-medium text-slate-900">{email || phone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OTP inputs */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-bold"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isSubmitting || otp.join('').length !== 6}
        >
          {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Resend */}
        <div className="mt-4 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-slate-500">
              Kirim ulang dalam {countdown} detik
            </p>
          ) : (
            <Button 
              variant="link" 
              onClick={handleResend}
              className="text-nu-green"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Kirim Ulang Kode
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-sm">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="text-nu-green hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1 inline" />
            Ganti {email ? 'email' : 'nomor HP'}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}