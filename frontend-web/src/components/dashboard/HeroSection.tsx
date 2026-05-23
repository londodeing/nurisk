import { Skeleton } from '@/components/ui/skeleton';

interface HeroSectionProps {
  isLoading: boolean;
}

export function HeroSection({ isLoading }: HeroSectionProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="bg-[#006837] px-6 pt-8 pb-14 rounded-b-[32px] shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl bg-white/20" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 bg-white/20" />
            <Skeleton className="h-6 w-32 bg-white/20" />
          </div>
        </div>
        <div className="flex gap-4 text-white/70 text-xs">
          <Skeleton className="h-3 w-20 bg-white/20" />
          <Skeleton className="h-3 w-28 bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#006837] px-6 pt-8 pb-14 rounded-b-[32px] shadow-[0_10px_30px_rgba(0,77,41,0.3)]">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-[#D4AF37] rounded-xl flex items-center justify-center text-xl shadow-[0_8px_20px_rgba(212,175,55,0.2)]">
          🛡️
        </div>
        <div>
          <p className="text-[11px] opacity-80 tracking-wider uppercase font-semibold">Pusdatin NU Peduli</p>
          <h1 className="font-['Playfair_Display',serif] text-2xl font-black">NURisk Jateng</h1>
        </div>
      </div>
      <div className="flex gap-4 text-white/70 text-xs mt-3">
        <span>⏱ {timeStr}</span>
        <span>📅 {dateStr}</span>
      </div>
    </div>
  );
}
