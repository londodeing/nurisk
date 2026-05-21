import { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, Loader } from 'lucide-react';
import useNotifications from '../api/useNotifications';
import useMarkAsRead from '../api/useMarkAsRead';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  incident: AlertTriangle,
  system: Info,
  alert: AlertCircle,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data, isLoading, unreadCount } = useNotifications({ page: 1, limit: 50 });
  const markAsRead = useMarkAsRead();

  const notifications = (data as any)?.items || [];

  const filtered = filter === 'unread'
    ? notifications.filter((n: any) => !n.readAt)
    : notifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-6 h-6 animate-spin text-nu-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-nu-green" />
          <h1 className="text-2xl font-bold text-slate-700">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => notifications.filter((n: any) => !n.readAt).forEach((n: any) => markAsRead.mutate(n.id))}
            className="flex items-center gap-1.5 text-sm text-nu-green hover:underline"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f ? 'bg-nu-green text-white border-nu-green' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Semua' : 'Belum Dibaca'} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: any) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => { if (!n.readAt) markAsRead.mutate(n.id); }}
                className={`bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                  !n.readAt ? 'border-l-4 border-l-nu-green' : 'border-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${!n.readAt ? 'bg-nu-green/10' : 'bg-slate-100'}`}>
                  <Icon className={`w-5 h-5 ${!n.readAt ? 'text-nu-green' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.readAt ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
                    {n.title}
                  </p>
                  {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-xs text-slate-400 mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                {!n.readAt && <span className="w-2 h-2 bg-nu-green rounded-full mt-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
