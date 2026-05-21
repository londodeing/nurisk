import { useState } from 'react';
import { Link } from 'react-router-dom';
import useRegister from '../api/useRegister';

export default function RegisterPage() {
  const register = useRegister();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Nama wajib diisi';
    if (!form.email.trim()) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Password tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register.mutateAsync({
        full_name: form.full_name,
        username: form.email,
        password: form.password,
        role: 'RELAWAN',
        region: '',
      } as any);
    } catch {
      // error handled via register.error
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Daftar</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nama Lengkap</label>
            <input value={form.full_name} onChange={set('full_name')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input type="password" value={form.password} onChange={set('password')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Konfirmasi Password</label>
            <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-nu-green focus:border-transparent" required />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {register.error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {(register.error as any)?.message || 'Gagal mendaftar. Silakan coba lagi.'}
            </div>
          )}

          <button type="submit" disabled={register.isPending} className="w-full bg-nu-green text-white py-2 rounded-lg font-medium hover:bg-nu-green/90 disabled:opacity-50">
            {register.isPending ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-nu-green hover:underline">Masuk</Link>
        </div>
      </div>
    </div>
  );
}
