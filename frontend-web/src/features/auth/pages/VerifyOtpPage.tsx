import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: () => sdk.auth.verifyOtp({ email, otp: digits.join('') }),
    onSuccess: () => navigate('/dashboard'),
  });

  const resendMutation = useMutation({
    mutationFn: () => sdk.auth.forgotPassword({ email }),
    onSuccess: () => setCooldown(60),
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d) && newDigits.join('').length === 6) {
      verifyMutation.mutate();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      refs.current[5]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-700 mb-2">Verifikasi Kode</h1>
        <p className="text-slate-500 mb-6">
          Masukkan kode 6 digit yang dikirim ke {email}
        </p>

        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent"
            />
          ))}
        </div>

        {verifyMutation.error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
            Kode tidak valid atau sudah kedaluwarsa.
          </div>
        )}

        <button
          onClick={() => verifyMutation.mutate()}
          disabled={verifyMutation.isPending || digits.some((d) => !d)}
          className="w-full bg-nu-green text-white py-2 rounded-lg font-medium hover:bg-nu-green/90 disabled:opacity-50 mb-4"
        >
          {verifyMutation.isPending ? 'Memverifikasi...' : 'Verifikasi'}
        </button>

        <div className="text-sm text-slate-500">
          Tidak menerima kode?{' '}
          {cooldown > 0 ? (
            <span className="text-slate-400">Kirim ulang dalam {cooldown}s</span>
          ) : (
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-nu-green hover:underline"
            >
              Kirim Ulang
            </button>
          )}
        </div>

        <div className="mt-4">
          <Link to="/login" className="text-sm text-nu-green hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
