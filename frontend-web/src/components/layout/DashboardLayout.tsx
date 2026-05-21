import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export function DashboardLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-14 bg-nu-green px-4 md:px-6 flex items-center justify-between shrink-0 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-white/80" />
          <h1 className="font-black text-white text-sm tracking-tight">
            PUSDATIN <span className="text-white/50 font-normal text-xs">NU</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <User size={16} className="text-white" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <LogOut size={16} className="text-white" />
          </button>
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
