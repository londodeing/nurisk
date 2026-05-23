import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BottomNav, PUBLIC_BOTTOM_NAV_ITEMS } from './BottomNav';
import { Bell, Wifi } from 'lucide-react';

interface PublicLayoutProps {
  className?: string;
}

export function PublicLayout({
  className,
}: PublicLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-[#F8FAF8]', className)}>
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#006837] flex items-center px-4 justify-between shrink-0 shadow-lg z-[5000]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">🛡️</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-white text-xs uppercase tracking-tight">
              NU RISK
            </span>
            <span className="text-[8px] text-white/50 font-semibold uppercase tracking-widest">
              Public Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-300" />
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="pt-14 pb-24">
        <Outlet />
      </main>

      <BottomNav menuItems={PUBLIC_BOTTOM_NAV_ITEMS} />
    </div>
  );
}

export default PublicLayout;
