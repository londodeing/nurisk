import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => sdk.auth.resetPassword({ token: token!, newPassword: password }),
    onSuccess: () => navigate('/login'),
    onError: () => setError('Tautan tidak valid atau sudah kedaluwarsa.'),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-4">Tautan Tidak Valid</h1>
          <p className="text-slate-500 mb-6">Tautan reset password tidak valid atau sudah kedaluwarsa.</p>
          <Link to="/forgot-password" className="text-nu-green hover:underline">Minta tautan baru</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (password !== confirmPassword) { setError('Password tidak cocok'); return; }
    setError('');
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password Baru</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Konfirmasi Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
          </div>

          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          {mutation.error && !error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">Gagal mereset password. Silakan coba lagi.</div>
          )}

          <button type="submit" disabled={mutation.isPending} className="w-full bg-nu-green text-white py-2 rounded-lg font-medium hover:bg-nu-green/90 disabled:opacity-50">
            {mutation.isPending ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
