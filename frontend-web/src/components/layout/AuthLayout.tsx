import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nu-green/5 via-white to-nu-gold/5 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-nu-green rounded-2xl flex items-center justify-center shadow-lg shadow-nu-green/20">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-nu-green tracking-tight">
          PUSDATIN <span className="text-nu-gold font-normal">NU</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
          Pelayanan Darurat Tanggap
        </p>
      </div>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
