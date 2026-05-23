import { useMemo } from 'react';
import { usePublicDashboardData } from '@/hooks/use-public-dashboard';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { WeatherAlertStrip } from '@/components/dashboard/WeatherAlertStrip';
import { ActiveIncidentsPanel } from '@/components/dashboard/ActiveIncidentsPanel';
import { ResourceAvailabilityPanel } from '@/components/dashboard/ResourceAvailabilityPanel';
import type { Incident } from '@nurisk/shared-types/incident';

export default function PublicDashboard() {
  const { incidents, stats, isLoading, error } = usePublicDashboardData();

  return (
    <div className="min-h-screen bg-[#F8FAF8] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="pt-6 md:pt-8 pb-8">
          <KpiGrid stats={stats} isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <WeatherAlertStrip lat={-7.2575} lon={112.7521} />

            <ActiveIncidentsPanel
              incidents={incidents}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="space-y-6 md:space-y-8">
            <ResourceAvailabilityPanel stats={stats} isLoading={isLoading} />

            <TrendChart incidents={incidents} isLoading={isLoading} />

            <DonationCard />

            <FooterInfo />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ incidents, isLoading }: { incidents: Incident[]; isLoading: boolean }) {
  const chartData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    incidents.forEach((inc) => {
      const d = new Date(inc.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    return Object.entries(monthCounts).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [incidents]);

  const maxVal = useMemo(() => Math.max(...chartData.map(([, c]) => c), 1), [chartData]);

  if (isLoading) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Trend Bencana</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_35px_rgba(0,104,55,0.08)] h-[160px] flex items-center justify-center">
          <div className="flex items-end gap-2.5 h-[100px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-8 bg-gray-200 rounded-t-lg animate-pulse" style={{ height: `${30 + Math.random() * 70}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  const monthLabels: Record<string, string> = {
    '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR', '05': 'MEI', '06': 'JUN',
    '07': 'JUL', '08': 'AGS', '09': 'SEP', '10': 'OKT', '11': 'NOV', '12': 'DES',
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="font-['Playfair_Display',serif] text-xl text-[#006837]">Trend Bencana</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="bg-white p-6 rounded-[32px] shadow-[0_15px_35px_rgba(0,104,55,0.08)]">
        <div className="flex items-end gap-2.5 h-[120px] pt-5">
          {chartData.map(([key, count]) => {
            const pct = (count / maxVal) * 100;
            const monthNum = key.split('-')[1] ?? '';
            const label = monthLabels[monthNum] || monthNum;
            return (
              <div key={key} className="flex-1 min-w-[30px] relative" style={{ height: `${pct}%` }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#006837] rounded-t-lg transition-all duration-500"
                  style={{ height: `${pct}%` }}
                >
                  <span className="absolute -top-5 left-0 right-0 text-center text-[10px] font-bold text-gray-700">
                    {count}
                  </span>
                </div>
                <span className="absolute -bottom-[22px] left-0 right-0 text-center text-[9px] font-semibold text-[#6B7280]">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DonationCard() {
  return (
    <div className="px-4 pt-6">
      <div className="bg-[#006837] text-white p-8 rounded-[32px] text-center relative overflow-hidden shadow-[0_10px_30px_rgba(0,77,41,0.4)]">
        <span className="absolute -top-3 -right-3 text-[80px] opacity-10 text-[#D4AF37] leading-none">✶</span>
        <h3 className="font-['Playfair_Display',serif] text-2xl mb-2.5">Mari Berkhidmat, Bantu Korban Bencana</h3>
        <p className="text-xs opacity-90 mb-5">
          Donasi Anda akan disalurkan langsung kepada korban bencana melalui NU Peduli Jateng.
        </p>
        <div className="bg-white inline-block p-4 rounded-[15px] mb-4">
          <div className="w-[100px] h-[100px] border-2 border-dashed border-gray-300 flex items-center justify-center text-[#6B7280] font-black text-xs">
            QR Code
          </div>
        </div>
        <br />
        <button className="bg-[#D4AF37] text-[#006837] border-none py-3.5 px-8 rounded-[50px] font-extrabold text-sm shadow-[0_8px_20px_rgba(212,175,55,0.2)] transition-transform active:scale-[0.98]">
          INFAK SEKARANG
        </button>
        <p className="text-[11px] opacity-70 mt-2.5">Transfer: BNI 1234567890 a.n. NU Peduli Jateng</p>
      </div>
    </div>
  );
}

function FooterInfo() {
  return (
    <div className="text-center py-6 text-[10px] text-[#6B7280]">
      <p className="font-bold">NU Risk — Pusdatin NU Peduli Jawa Tengah</p>
      <p className="mt-1">© {new Date().getFullYear()} NU Peduli Jateng. All rights reserved.</p>
    </div>
  );
}
