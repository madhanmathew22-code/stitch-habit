import { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  Sparkles,
  ShieldCheck,
  Send,
  Trash2,
  CalendarCheck,
  Flame,
} from 'lucide-react';
import { Habit, ReminderNotification, ReminderSettings } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  triggerDailyReminder,
  playChimeSound,
} from '../services/notificationService';

interface NotificationCenterModalProps {
  habits: Habit[];
  settings: ReminderSettings;
  notifications: ReminderNotification[];
  onUpdateSettings: (settings: ReminderSettings) => void;
  onUpdateNotifications: (notifications: ReminderNotification[]) => void;
  onToggleHabit: (id: string) => void;
  onClose: () => void;
  onTriggerToast: (notif: ReminderNotification) => void;
}

export default function NotificationCenterModal({
  habits,
  settings,
  notifications,
  onUpdateSettings,
  onUpdateNotifications,
  onToggleHabit,
  onClose,
  onTriggerToast,
}: NotificationCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'inbox'>('settings');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const incompleteHabits = habits.filter((h) => !h.completed);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleToggleEnabled = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    onUpdateSettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...settings, scheduledTime: time };
    onUpdateSettings(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    if (updated.soundEnabled) {
      playChimeSound();
    }
  };

  const handleSendTestReminder = () => {
    const { notification } = triggerDailyReminder(habits, settings, true);
    if (notification) {
      onTriggerToast(notification);
      // Update notifications state
      onUpdateNotifications([notification, ...notifications]);
      setTestSentMessage(
        incompleteHabits.length > 0
          ? `Sent reminder for ${incompleteHabits.length} pending habit${incompleteHabits.length > 1 ? 's' : ''}!`
          : 'Sent completion celebration reminder!'
      );
      setTimeout(() => setTestSentMessage(null), 3500);
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    onUpdateNotifications(updated);
  };

  const handleClearHistory = () => {
    onUpdateNotifications([]);
  };

  // Convert 24hr string to 12hr display
  const formatTimeDisplay = (time24: string) => {
    if (!time24) return '8:00 PM';
    const [hoursStr, minsStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minsStr} ${ampm}`;
  };

  const presetTimes = [
    { label: '8:00 AM', value: '08:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '8:00 PM', value: '20:00' },
    { label: '9:30 PM', value: '21:30' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      data-purpose="notification-center-modal"
    >
      <div
        className="bg-[#F8FAFC] w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Daily Habit Reminders
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Daily reminder at {formatTimeDisplay(settings.scheduledTime)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white px-5 pt-1 pb-3 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Reminder Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts Inbox {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {activeTab === 'settings' ? (
            <>
              {/* Daily Reminder Main Toggle */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daily Incomplete Habit Alert</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sends reminders for remaining habits to protect your streaks
                    </p>
                  </div>
                  {/* Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.enabled}
                    onClick={handleToggleEnabled}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                        settings.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.enabled && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Time Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">Scheduled Time</span>
                        <span className="text-xs font-bold text-emerald-600">
                          {formatTimeDisplay(settings.scheduledTime)}
                        </span>
                      </div>

                      {/* Preset Pills */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2.5">
                        {presetTimes.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => handleTimeChange(preset.value)}
                            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              settings.scheduledTime === preset.value
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Time Input */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Custom Reminder Time</span>
                        </div>
                        <input
                          type="time"
                          value={settings.scheduledTime}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          className="bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Sound Chime Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {settings.soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-semibold text-slate-700">Audio Chime Sound</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleSound}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          settings.soundEnabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {settings.soundEnabled ? 'Enabled' : 'Muted'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Browser Permission Card */}
              <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Browser System Notifications</div>
                    <p className="text-[11px] text-slate-500">
                      {permission === 'granted'
                        ? 'Permitted on this device'
                        : permission === 'denied'
                        ? 'Notifications currently blocked in browser'
                        : 'Allow alerts even if window is minimized'}
                    </p>
                  </div>
                </div>

                {permission !== 'granted' && permission !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    Enable
                  </button>
                )}

                {permission === 'granted' && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Incomplete Habits Preview Today */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Pending Today ({incompleteHabits.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {incompleteHabits.length === 0 ? 'All Completed! 🎉' : 'Will be notified'}
                  </span>
                </div>

                {incompleteHabits.length === 0 ? (
                  <div className="py-4 text-center bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-800">
                    <CalendarCheck className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                    <p className="text-xs font-bold">You're all done for today!</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      No incomplete habits to remind you of.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incompleteHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleHabit(habit.id)}
                            className="text-slate-300 hover:text-emerald-500 transition cursor-pointer"
                            aria-label={`Mark ${habit.name} complete`}
                          >
                            <Circle className="w-5 h-5" />
                          </button>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{habit.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {habit.subtitle} • {habit.category || 'Daily'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleHabit(habit.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-emerald-600 text-[11px] font-semibold transition cursor-pointer shrink-0"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Reminder Trigger Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSendTestReminder}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Reminder Now</span>
                </button>

                {testSentMessage && (
                  <p className="text-[11px] text-center font-semibold text-emerald-600 animate-in fade-in">
                    {testSentMessage}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Inbox Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reminder History ({notifications.length})
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">No reminder alerts recorded yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Scheduled reminders will appear here when triggered.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        notif.read
                          ? 'bg-white border-slate-100 text-slate-600'
                          : 'bg-emerald-50/40 border-emerald-200/80 text-slate-900 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          )}
                          <h4>{notif.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-slate-600 mb-2">
                        {notif.body}
                      </p>

                      {notif.incompleteHabitNames.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {notif.incompleteHabitNames.map((name) => (
                            <span
                              key={name}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-100 shrink-0 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-98 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
