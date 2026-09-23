import { Habit, ReminderNotification, ReminderSettings } from '../types';

const SETTINGS_KEY = 'habitflow_reminder_settings_v1';
const NOTIFICATIONS_KEY = 'habitflow_notifications_v1';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  scheduledTime: '20:00', // 8:00 PM default daily check-in
  soundEnabled: true,
  notifyOnAllCompleted: false,
  hourlyEnabled: true, // Default to true so user gets hourly reminders
  hourlyIntervalHours: 1, // Every 1 hr
  lastHourlyNotifiedTimestamp: 0,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// Play a pleasant gentle chime using Web Audio API
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Audio might be blocked by autoplay policies until user interaction
  }
}

export function getStoredSettings(): ReminderSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_REMINDER_SETTINGS,
        ...parsed,
        hourlyEnabled: parsed.hourlyEnabled !== undefined ? parsed.hourlyEnabled : true,
        hourlyIntervalHours: parsed.hourlyIntervalHours || 1,
      };
    }
  } catch (e) {
    // Fallback on default
  }
  return DEFAULT_REMINDER_SETTINGS;
}

export function saveStoredSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // LocalStorage fallback
  }
}

export function getStoredNotifications(): ReminderNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    // LocalStorage fallback
  }
  return [
    {
      id: 'init-reminder-1',
      title: 'Daily Habit Reminder ⏰',
      body: 'You have 2 habits remaining today: Exercise and Meditate. Keep your streak alive!',
      timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      incompleteHabitIds: ['habit-2', 'habit-4'],
      incompleteHabitNames: ['Exercise', 'Meditate'],
      read: true,
      type: 'daily_reminder',
    },
  ];
}

export function saveStoredNotifications(notifications: ReminderNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    // LocalStorage fallback
  }
}

// Request Browser Web Notification Permission safely
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    return 'denied';
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Build reminder and dispatch via system Notification + in-app storage
export function triggerDailyReminder(
  habits: Habit[],
  settings: ReminderSettings,
  isManualTest: boolean = false
): { notification: ReminderNotification | null; reason: string } {
  const incomplete = habits.filter((h) => !h.completed);

  if (incomplete.length === 0 && !settings.notifyOnAllCompleted && !isManualTest) {
    return { notification: null, reason: 'All habits completed for today' };
  }

  let title = 'Daily Habit Reminder ⏰';
  let body = '';

  if (incomplete.length > 0) {
    const habitNames = incomplete.map((h) => h.name);
    const namesStr =
      habitNames.length <= 2
        ? habitNames.join(' and ')
        : `${habitNames.slice(0, 2).join(', ')} +${habitNames.length - 2} more`;

    title = `Daily Reminder (${incomplete.length} pending) ⏰`;
    body = `You still have ${incomplete.length} incomplete habit${
      incomplete.length > 1 ? 's' : ''
    } today: ${namesStr}. Complete them now to protect your streak!`;
  } else {
    title = 'All Habits Done! 🌟';
    body = 'Fantastic job! You completed all your habits for today. Your streak is secure.';
  }

  const newNotification: ReminderNotification = {
    id: `remind-${Date.now()}`,
    title,
    body,
    timestamp: new Date().toISOString(),
    incompleteHabitIds: incomplete.map((h) => h.id),
    incompleteHabitNames: incomplete.map((h) => h.name),
    read: false,
    type: 'daily_reminder',
  };

  // Play audio chime if enabled
  if (settings.soundEnabled) {
    playChimeSound();
  }

  // Attempt Web Browser Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'habitflow-daily-reminder',
      });
    } catch (e) {
      // Browser notification might be restricted in iframe
    }
  }

  // Store in notification history
  const currentNotifications = getStoredNotifications();
  const updatedNotifications = [newNotification, ...currentNotifications.slice(0, 19)];
  saveStoredNotifications(updatedNotifications);

  // Update lastNotifiedDate
  const todayDateStr = new Date().toISOString().split('T')[0];
  saveStoredSettings({ ...settings, lastNotifiedDate: todayDateStr });

  return { notification: newNotification, reason: 'Success' };
}

// Check if current time falls within user's quiet hours
export function isWithinQuietHours(
  now: Date,
  quietStart: string = '22:00',
  quietEnd: string = '08:00'
): boolean {
  try {
    const [startH, startM] = quietStart.split(':').map(Number);
    const [endH, endM] = quietEnd.split(':').map(Number);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins > endMins) {
      // Crosses midnight, e.g. 22:00 to 08:00
      return currentMins >= startMins || currentMins < endMins;
    } else {
      // Same day interval
      return currentMins >= startMins && currentMins < endMins;
    }
  } catch {
    return false;
  }
}

// Build and dispatch an hourly reminder notification every 1 hr
export function triggerHourlyReminder(
  habits: Habit[],
  settings: ReminderSettings,
  isManualTest: boolean = false
): { notification: ReminderNotification | null; reason: string } {
  const now = new Date();

  // Check quiet hours if enabled and not a manual test trigger
  if (
    !isManualTest &&
    settings.quietHoursEnabled &&
    isWithinQuietHours(now, settings.quietHoursStart || '22:00', settings.quietHoursEnd || '08:00')
  ) {
    return { notification: null, reason: 'Quiet hours active' };
  }

  const incomplete = habits.filter((h) => !h.completed);

  if (incomplete.length === 0 && !settings.notifyOnAllCompleted && !isManualTest) {
    return { notification: null, reason: 'All habits completed for today' };
  }

  let title = 'Hourly Habit Check-in ⏱️';
  let body = '';

  const intervalLabel = settings.hourlyIntervalHours === 1 ? 'Hourly' : `Every ${settings.hourlyIntervalHours}h`;

  if (incomplete.length > 0) {
    const habitNames = incomplete.map((h) => h.name);
    const namesStr =
      habitNames.length <= 2
        ? habitNames.join(' and ')
        : `${habitNames.slice(0, 2).join(', ')} +${habitNames.length - 2} more`;

    title = `${intervalLabel} Reminder (${incomplete.length} pending) ⏱️`;
    body = `Hourly nudge: Take 2 minutes to check off your remaining habit${
      incomplete.length > 1 ? 's' : ''
    }: ${namesStr}. Keep up your momentum!`;
  } else {
    title = `${intervalLabel} Check: All Done! 🌟`;
    body = 'Awesome progress! All habits for today are completed. Enjoy your focused day!';
  }

  const newNotification: ReminderNotification = {
    id: `hourly-remind-${Date.now()}`,
    title,
    body,
    timestamp: now.toISOString(),
    incompleteHabitIds: incomplete.map((h) => h.id),
    incompleteHabitNames: incomplete.map((h) => h.name),
    read: false,
    type: 'hourly_reminder',
  };

  // Play audio chime if enabled
  if (settings.soundEnabled) {
    playChimeSound();
  }

  // Attempt Web Browser Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'habitflow-hourly-reminder',
      });
    } catch (e) {
      // Browser notification might be restricted in iframe
    }
  }

  // Store in notification history
  const currentNotifications = getStoredNotifications();
  const updatedNotifications = [newNotification, ...currentNotifications.slice(0, 19)];
  saveStoredNotifications(updatedNotifications);

  // Update lastHourlyNotifiedTimestamp
  saveStoredSettings({ ...settings, lastHourlyNotifiedTimestamp: now.getTime() });

  return { notification: newNotification, reason: 'Success' };
}

