import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { sdk } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => sdk.auth.forgotPassword({ email }),
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-4">Cek Email Anda</h1>
          <p className="text-slate-500 mb-6">
            Jika akun dengan email tersebut terdaftar, tautan reset password akan dikirim.
          </p>
          <Link to="/login" className="text-nu-green hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Lupa Password</h1>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent"
              required
            />
          </div>

          {mutation.error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              Gagal mengirim email. Silakan coba lagi.
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-nu-green text-white py-2 rounded-lg font-medium hover:bg-nu-green/90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-nu-green hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
