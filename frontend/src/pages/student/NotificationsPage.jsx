import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useToast } from '../../contexts/ToastContext';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  Calendar,
  CheckSquare,
  Briefcase,
  Megaphone,
  Clock,
  Settings,
  Check,
} from 'lucide-react';

export const NotificationsPage = () => {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'settings'
  const { setUnreadCount } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Fetch notifications
  const { data: notifData, isLoading, refetch } = useQuery({
    queryKey: ['notifications-history', unreadOnly],
    queryFn: async () => {
      const res = await api.get(`/notifications?limit=50&unreadOnly=${unreadOnly}`);
      return res.data;
    },
  });

  // Fetch preferences
  const { data: prefData, refetch: refetchPref } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get('/notifications/preferences'),
  });

  const notifications = notifData?.notifications || [];
  const preferences = prefData?.data || {};

  const handleMarkAsRead = async (id, linkUrl) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      refetch();
      if (linkUrl) navigate(linkUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      addToast('All notifications marked as read', 'info');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleTogglePreference = async (key, currentValue) => {
    try {
      await api.patch('/notifications/preferences', {
        [key]: !currentValue,
      });
      addToast('Notification preferences updated', 'success');
      refetchPref();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event reminders, task deadlines, and recruitment notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'history' && (
            <button
              onClick={handleMarkAllRead}
              className="py-2 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}

          <button
            onClick={() => setActiveTab(activeTab === 'history' ? 'settings' : 'history')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {activeTab === 'settings' ? 'Back to History' : 'Preferences'}
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          {/* Filter subheader */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnreadOnly(false)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  !unreadOnly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200/60'
                }`}
              >
                All Notifications
              </button>
              <button
                onClick={() => setUnreadOnly(true)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  unreadOnly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200/60'
                }`}
              >
                Unread Only
              </button>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {notifications.length} items
            </span>
          </div>

          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => {
                let Icon = Bell;
                if (notif.type.startsWith('EVENT')) Icon = Calendar;
                if (notif.type.startsWith('TASK')) Icon = CheckSquare;
                if (notif.type.startsWith('RECRUIT')) Icon = Briefcase;
                if (notif.type.startsWith('ANNOUNCE')) Icon = Megaphone;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id, notif.linkUrl)}
                    className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        !notif.isRead
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    </div>

                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0 self-center"></span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No notifications"
              description="You have caught up with all campus alerts and updates."
            />
          )}
        </div>
      ) : (
        /* Settings panel */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Notification Delivery Preferences
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="font-bold text-sm text-slate-800 block">Event Approaching Reminders</span>
                <span className="text-xs text-slate-500">
                  Receive automatic alerts 24 hours and 1 hour before scheduled events
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppEvents ?? true}
                onChange={() => handleTogglePreference('inAppEvents', preferences.inAppEvents)}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="font-bold text-sm text-slate-800 block">Task Assignment & Deadlines</span>
                <span className="text-xs text-slate-500">
                  Receive notifications when tasks are assigned, modified, or near deadline
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppTasks ?? true}
                onChange={() => handleTogglePreference('inAppTasks', preferences.inAppTasks)}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="font-bold text-sm text-slate-800 block">Club Announcements</span>
                <span className="text-xs text-slate-500">
                  Receive notices and broadcast updates from joined clubs
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppAnnouncements ?? true}
                onChange={() =>
                  handleTogglePreference('inAppAnnouncements', preferences.inAppAnnouncements)
                }
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <span className="font-bold text-sm text-slate-800 block">Email Reminders</span>
                <span className="text-xs text-slate-500">
                  Dispatch email notifications for critical schedule changes
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailEventReminders ?? true}
                onChange={() =>
                  handleTogglePreference('emailEventReminders', preferences.emailEventReminders)
                }
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
