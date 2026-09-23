import { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Timer,
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
  Moon,
  Zap,
} from 'lucide-react';
import { Habit, ReminderNotification, ReminderSettings } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  triggerDailyReminder,
  triggerHourlyReminder,
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

  const handleToggleHourlyEnabled = () => {
    const updated = {
      ...settings,
      hourlyEnabled: !settings.hourlyEnabled,
      lastHourlyNotifiedTimestamp: Date.now(),
    };
    onUpdateSettings(updated);
  };

  const handleHourlyIntervalChange = (hours: number) => {
    const updated = {
      ...settings,
      hourlyIntervalHours: hours,
      lastHourlyNotifiedTimestamp: Date.now(),
    };
    onUpdateSettings(updated);
  };

  const handleToggleQuietHours = () => {
    const updated = {
      ...settings,
      quietHoursEnabled: !settings.quietHoursEnabled,
    };
    onUpdateSettings(updated);
  };

  const handleSendTestHourlyReminder = () => {
    const { notification } = triggerHourlyReminder(habits, settings, true);
    if (notification) {
      onTriggerToast(notification);
      onUpdateNotifications([notification, ...notifications]);
      setTestSentMessage(
        incompleteHabits.length > 0
          ? `Sent 1-hr reminder for ${incompleteHabits.length} pending habit${incompleteHabits.length > 1 ? 's' : ''}!`
          : 'Sent hourly check celebration reminder!'
      );
      setTimeout(() => setTestSentMessage(null), 3500);
    }
  };

  const getNextHourlyReminderEstimate = () => {
    if (!settings.hourlyEnabled) return null;
    const intervalMs = (settings.hourlyIntervalHours || 1) * 60 * 60 * 1000;
    const lastTime = settings.lastHourlyNotifiedTimestamp || Date.now();
    const nextTime = lastTime + intervalMs;
    const diffMins = Math.max(1, Math.round((nextTime - Date.now()) / (60 * 1000)));
    if (diffMins <= 1) return 'Within 1 min';
    if (diffMins < 60) return `In ~${diffMins}m`;
    const hrs = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return `In ~${hrs}h ${remMins}m`;
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
                Habit Reminders
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {settings.hourlyEnabled ? 'Hourly (Every 1h) • ' : ''}Daily at {formatTimeDisplay(settings.scheduledTime)}
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
              {/* Hourly Reminder Card (Every 1 hr) */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/80 ring-1 ring-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">Hourly Reminder</h3>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Every 1 hr
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nudges you throughout the day to complete remaining habits
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.hourlyEnabled}
                    onClick={handleToggleHourlyEnabled}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.hourlyEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                        settings.hourlyEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.hourlyEnabled && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Interval selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">Repeat Interval</span>
                        <span className="text-xs font-bold text-emerald-600">
                          {settings.hourlyIntervalHours === 1 ? 'Every 1 Hour' : `Every ${settings.hourlyIntervalHours} Hours`}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => handleHourlyIntervalChange(hrs)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                              (settings.hourlyIntervalHours || 1) === hrs
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            {hrs === 1 ? 'Every 1 hr' : `Every ${hrs} hrs`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Next reminder status */}
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Active: Next hourly nudge</span>
                      </div>
                      <span className="font-bold text-emerald-700">
                        {getNextHourlyReminderEstimate()}
                      </span>
                    </div>

                    {/* Quiet Hours / Sleep Mode Toggle */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-xs font-semibold text-slate-700">Night Quiet Hours</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={settings.quietHoursEnabled}
                          onClick={handleToggleQuietHours}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            settings.quietHoursEnabled ? 'bg-indigo-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                              settings.quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {settings.quietHoursEnabled && (
                        <div className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                          <span className="text-indigo-900 font-medium">Pause between:</span>
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <input
                              type="time"
                              value={settings.quietHoursStart || '22:00'}
                              onChange={(e) =>
                                onUpdateSettings({ ...settings, quietHoursStart: e.target.value })
                              }
                              className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-xs cursor-pointer"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={settings.quietHoursEnd || '08:00'}
                              onChange={(e) =>
                                onUpdateSettings({ ...settings, quietHoursEnd: e.target.value })
                              }
                              className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-xs cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Reminder Main Toggle */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Daily Evening Review</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evening check-in to review streaks and complete remaining tasks
                      </p>
                    </div>
                  </div>
                  {/* Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.enabled}
                    onClick={handleToggleEnabled}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enabled ? 'bg-blue-500' : 'bg-slate-200'
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
                        <span className="text-xs font-bold text-blue-600">
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
                                ? 'bg-blue-500 text-white shadow-xs'
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
                          className="bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sound & System Notification Controls */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alert Sound & System</h4>

                {/* Sound Chime Toggle */}
                <div className="flex items-center justify-between">
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

                {/* Browser Permission Card */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Browser System Push</div>
                      <p className="text-[10px] text-slate-500">
                        {permission === 'granted'
                          ? 'Active on this device'
                          : permission === 'denied'
                          ? 'Notifications blocked'
                          : 'Alerts even when minimized'}
                      </p>
                    </div>
                  </div>

                  {permission !== 'granted' && permission !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Enable
                    </button>
                  )}

                  {permission === 'granted' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
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

              {/* Test Reminder Trigger Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSendTestHourlyReminder}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Test 1-Hr Reminder</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestReminder}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-98 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Test Daily Alert</span>
                  </button>
                </div>

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
                        <div className="flex items-center gap-1.5 font-bold text-xs flex-wrap">
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          )}
                          <h4>{notif.title}</h4>
                          {notif.type === 'hourly_reminder' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                              1-Hr Nudge
                            </span>
                          )}
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
