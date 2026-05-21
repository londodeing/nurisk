import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, AlertTriangle, MessageSquare, Users, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead';
import type { Notification } from '@nurisk/shared-types/notification';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: notificationsResponse, unreadCount } = useNotifications({ unreadOnly: true });
  const notifications: Notification[] = notificationsResponse?.items ?? [];
  const { mutate: markAsRead } = useMarkAsRead();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'INCIDENT_REPORTED':
      case 'INCIDENT_ASSIGNED':
      case 'INCIDENT_UPDATED':
      case 'INCIDENT_RESOLVED':
      case 'ASSESSMENT_REQUEST':
      case 'ASSESSMENT_COMPLETE':
      case 'TEAM_DEPLOYED':
      case 'TEAM_ARRIVED':
      case 'ALERT':
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-danger-red" />;
      case 'MESSAGE_RECEIVED':
      case 'MENTION':
        return <MessageSquare className="w-4 h-4 text-nu-green" />;
      case 'INFO':
        return <CheckCircle className="w-4 h-4 text-safe-green" />;
      default:
        return <Users className="w-4 h-4 text-warning-yellow" />;
    }
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    return `${days}h`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-red text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <Link to="/admin/notifications" className="text-sm text-nu-green hover:underline">
              Lihat semua
            </Link>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-slate-500">Tidak ada notifikasi</p>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 border-b hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-medium' : ''}`}>{notif.title}</p>
                      <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          markAsRead(notif.id as any);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}