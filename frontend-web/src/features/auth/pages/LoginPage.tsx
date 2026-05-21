import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLogin from '../api/useLogin';

export default function LoginPage() {
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login.mutateAsync({ email, password } as any);
    } catch {
      // error handled via login.error
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Masuk</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent"
              required
            />
          </div>

          {login.error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {(login.error as any)?.message || 'Gagal masuk. Periksa kembali email dan password Anda.'}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-nu-green text-white py-2 rounded-lg font-medium hover:bg-nu-green/90 disabled:opacity-50"
          >
            {login.isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="text-nu-green hover:underline">Lupa password?</Link>
        </div>

        <div className="mt-2 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-nu-green hover:underline">Daftar</Link>
        </div>
      </div>
    </div>
  );
}
