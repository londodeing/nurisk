import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RegisterProgress } from '@/components/forms/RegisterProgress';
import { RegisterStep1, INITIAL_STEP1_DATA } from '@/components/forms/RegisterStep1';
import { RegisterStep2, INITIAL_STEP2_DATA } from '@/components/forms/RegisterStep2';
import { RegisterStep3, INITIAL_STEP3_DATA } from '@/components/forms/RegisterStep3';
import { useSendOtp, useVerifyOtp, useRegister } from '@/hooks/use-auth';
import type { Step1Data } from '@/components/forms/RegisterStep1';
import type { Step2Data } from '@/components/forms/RegisterStep2';
import type { Step3Data } from '@/components/forms/RegisterStep3';

type StepErrors = Partial<Record<string, string>>;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Data>(INITIAL_STEP1_DATA);
  const [step2, setStep2] = useState<Step2Data>(INITIAL_STEP2_DATA);
  const [step3, setStep3] = useState<Step3Data>(INITIAL_STEP3_DATA);
  const [errors, setErrors] = useState<StepErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const register = useRegister();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const e: StepErrors = {};
    if (!step1.name.trim()) e.name = 'Nama lengkap wajib diisi';
    if (!/^\d{16}$/.test(step1.nik)) e.nik = 'NIK harus 16 digit';
    if (!step1.birthDate) e.birthDate = 'Tanggal lahir wajib diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) e.email = 'Email tidak valid';
    if (!/^(\+62|62|0)\d{9,12}$/.test(step1.phone.replace(/\D/g, ''))) e.phone = 'Nomor HP tidak valid';
    if (step1.password.length < 8) e.password = 'Password minimal 8 karakter';
    if (step1.password !== step1.confirmPassword) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [step1]);

  const validateStep2 = useCallback((): boolean => {
    const e: StepErrors = {};
    if (!step2.role) e.role = 'Pilih peran Anda';
    if (!step2.organization) e.organization = 'Pilih Badan Otonom NU';
    if (!step2.province.trim()) e.province = 'Provinsi wajib diisi';
    if (!step2.city.trim()) e.city = 'Kabupaten/Kota wajib diisi';
    if (!step2.district.trim()) e.district = 'Kecamatan wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [step2]);

  const handleNext = useCallback(() => {
    setGeneralError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) {
      setStep(3);
      handleSendOtp();
    }
  }, [step, validateStep1, validateStep2]);

  const handleBack = useCallback(() => {
    setGeneralError('');
    setErrors({});
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSendOtp = useCallback(async () => {
    setGeneralError('');
    try {
      await sendOtp.mutateAsync({
        email: step1.email,
        phone: step1.phone.replace(/^0/, '+62'),
      });
      startCountdown();
    } catch {
      setGeneralError('Gagal mengirim OTP. Silakan coba lagi.');
    }
  }, [step1.email, step1.phone, sendOtp, startCountdown]);

  const handleResendOtp = useCallback(async () => {
    await handleSendOtp();
  }, [handleSendOtp]);

  const handleSubmit = useCallback(async () => {
    setGeneralError('');
    setErrors({});

    if (step3.otp.length !== 6) {
      setErrors({ otp: 'OTP harus 6 digit' });
      return;
    }

    try {
      await verifyOtp.mutateAsync({
        email: step1.email,
        phone: step1.phone.replace(/^0/, '+62'),
        otp: step3.otp,
      });

      await register.mutateAsync({
        name: step1.name,
        email: step1.email,
        password: step1.password,
        phone: step1.phone.replace(/^0/, '+62'),
        nik: step1.nik,
        birthDate: step1.birthDate,
      });
    } catch {
      setGeneralError('Verifikasi gagal. Silakan coba lagi.');
    }
  }, [step3.otp, step1, verifyOtp, register]);

  const isSubmitting =
    sendOtp.isPending || verifyOtp.isPending || register.isPending;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Daftar Akun</CardTitle>
      </CardHeader>

      <RegisterProgress currentStep={step} />

      <CardContent>
        {generalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <RegisterStep1
            data={step1}
            onChange={setStep1}
            errors={errors as Record<keyof Step1Data, string>}
          />
        )}

        {step === 2 && (
          <RegisterStep2
            data={step2}
            onChange={setStep2}
            errors={errors as Record<keyof Step2Data, string>}
          />
        )}

        {step === 3 && (
          <>
            <RegisterStep3
              data={step3}
              onChange={setStep3}
              errors={errors as Record<keyof Step3Data, string>}
              email={step1.email}
              phone={step1.phone}
              onResendOtp={handleResendOtp}
              isResending={sendOtp.isPending}
              countdown={countdown}
            />
            <div className="mt-4 bg-nu-green/5 border border-nu-green/20 rounded-lg p-3">
              <p className="text-xs text-nu-green-dark text-center">
                Dengan mendaftar, Anda menyetujui{' '}
                <Link to="/terms" className="underline">Syarat & Ketentuan</Link> dan{' '}
                <Link to="/privacy" className="underline">Kebijakan Privasi</Link>
              </p>
            </div>
          </>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext}>
              Lanjut
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Daftar'}
            </Button>
          )}
        </div>

        {step === 1 && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-nu-green hover:underline font-medium">
              Masuk
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
