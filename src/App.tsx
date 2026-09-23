/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId, TransitionType, Habit, ReminderNotification, ReminderSettings, MoodId } from './types';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import AddHabitScreen from './components/AddHabitScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import NotificationToast from './components/NotificationToast';
import { ThemeProvider } from './context/ThemeContext';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredNotifications,
  saveStoredNotifications,
  triggerDailyReminder,
  triggerHourlyReminder,
} from './services/notificationService';
import {
  getStoredTotalXp,
  saveStoredTotalXp,
  calculateLevelStats,
  XP_PER_HABIT,
} from './utils/xpSystem';

const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Drink Water',
    subtitle: '8 glasses daily',
    timeOfDay: 'morning',
    icon: 'water',
    completed: true,
    category: 'Health',
    frequency: 'Daily',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'day',
      label: 'Every day',
    },
    todayMood: 'energized',
    todayMoodNote: 'Felt refreshed and hydrated early in the morning',
    todayMoodLoggedAt: '7:45 AM',
    completionHistory: [
      true, true, true, true, true, true, true, true, true, true,
      true, true, true, true, true, true, true, true, true, true,
      true, true, true, true, true, true, true, true, true,
    ],
    moodHistory: [
      'energized', 'calm', 'energized', 'energized', 'accomplished', 'energized', 'calm',
      'energized', 'energized', 'accomplished', 'energized', 'energized', 'calm', 'energized',
      'energized', 'accomplished', 'energized', 'calm', 'energized', 'energized', 'energized',
      'accomplished', 'energized', 'energized', 'calm', 'energized', 'accomplished', 'energized', 'energized',
    ],
  },
  {
    id: 'habit-2',
    name: 'Exercise',
    subtitle: '3 times a week',
    timeOfDay: 'morning',
    icon: 'exercise',
    completed: false,
    category: 'Fitness',
    frequency: 'Weekly',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 3,
      period: 'week',
      daysOfWeek: [1, 3, 5],
      label: '3 times a week',
    },
    completionHistory: [
      true, false, true, true, false, true, false, true, true, true,
      false, false, true, true, false, true, true, false, true, false,
      true, true, false, true, false, true, true, true, false,
    ].slice(0, 24).concat([true, false, true, true, true]),
    moodHistory: [
      'energized', null, 'accomplished', 'energized', null, 'accomplished', null, 'energized', 'accomplished', 'energized',
      null, null, 'energized', 'accomplished', null, 'energized', 'tired', null, 'accomplished', null,
      'energized', 'accomplished', null, 'energized', null, 'accomplished', 'energized', 'accomplished', 'accomplished',
    ],
  },
  {
    id: 'habit-3',
    name: 'Read a Book',
    subtitle: '15 minutes',
    timeOfDay: 'afternoon',
    icon: 'book',
    completed: true,
    category: 'Learning',
    frequency: 'Daily',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'day',
      label: 'Every day',
    },
    todayMood: 'calm',
    todayMoodNote: 'Quiet, reflective reading on habit design',
    todayMoodLoggedAt: '2:15 PM',
    completionHistory: [
      true, true, false, true, true, true, false, true, true, true,
      true, false, true, true, true, false, true, true, true, true,
      true, false, true, false, true, true, true, true, true,
    ].slice(0, 23).concat([false, true, true, true, true, true]),
    moodHistory: [
      'calm', 'calm', null, 'calm', 'neutral', 'calm', null, 'calm', 'accomplished', 'calm',
      'calm', null, 'calm', 'calm', 'calm', null, 'calm', 'accomplished', 'calm', 'calm',
      'calm', null, 'calm', null, 'calm', 'calm', 'calm', 'calm', 'calm',
    ],
  },
  {
    id: 'habit-4',
    name: 'Meditate',
    subtitle: '10 minutes',
    timeOfDay: 'evening',
    icon: 'meditate',
    completed: false,
    category: 'Mindfulness',
    frequency: 'Custom',
    targetFrequency: {
      mode: 'specific_days',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: 'Mon – Fri',
    },
    completionHistory: [
      true, false, true, false, true, true, false, false, true, true,
      false, true, false, true, true, false, true, false, true, true,
      false, false, true, false, false, false, false, true, true,
    ],
    moodHistory: [
      'calm', null, 'calm', null, 'calm', 'calm', null, null, 'calm', 'calm',
      null, 'calm', null, 'calm', 'calm', null, 'calm', null, 'calm', 'calm',
      null, null, 'calm', null, null, null, null, 'calm', 'calm',
    ],
  },
  {
    id: 'habit-5',
    name: 'No Junk Food',
    subtitle: 'Stay healthy',
    timeOfDay: 'all',
    icon: 'junk_food',
    completed: true,
    category: 'Health',
    frequency: 'Daily',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'day',
      label: 'Every day',
    },
    todayMood: 'accomplished',
    todayMoodNote: 'Cooked fresh whole foods with natural ingredients',
    todayMoodLoggedAt: '1:10 PM',
    completionHistory: [
      true, true, false, true, true, true, true, false, true, true,
      true, true, true, false, true, true, true, true, true, true,
      true, true, true, true, true, true, true, true, true,
    ],
    moodHistory: [
      'accomplished', 'accomplished', null, 'accomplished', 'accomplished', 'neutral', 'accomplished', null, 'accomplished', 'accomplished',
      'accomplished', 'accomplished', 'accomplished', null, 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished',
      'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished', 'accomplished',
    ],
  },
  {
    id: 'habit-6',
    name: 'Journaling',
    subtitle: '5 minutes reflection',
    timeOfDay: 'evening',
    icon: 'leaf',
    completed: true,
    category: 'Personal',
    frequency: 'Daily',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'day',
      label: 'Every day',
    },
    todayMood: 'calm',
    todayMoodNote: 'Gratitude journal entry before dinner',
    todayMoodLoggedAt: '6:30 PM',
    completionHistory: [
      true, true, false, true, true, false, true, true, true, false,
      true, true, false, true, true, true, true, false, true, true,
      true, false, true, false, false, true, true, true, true,
    ],
    moodHistory: [
      'calm', 'calm', null, 'calm', 'calm', null, 'calm', 'calm', 'accomplished', null,
      'calm', 'calm', null, 'calm', 'calm', 'calm', 'calm', null, 'calm', 'calm',
      'calm', null, 'calm', null, null, 'calm', 'calm', 'calm', 'calm',
    ],
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('onboarding');
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);

  // Local notification reminder system state
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(getStoredSettings);
  const [notifications, setNotifications] = useState<ReminderNotification[]>(getStoredNotifications);
  const [activeToastNotification, setActiveToastNotification] = useState<ReminderNotification | null>(null);

  // Experience Points (XP) & Gamification Level System
  const [totalXp, setTotalXp] = useState<number>(() => getStoredTotalXp(INITIAL_HABITS));
  const [recentXpGained, setRecentXpGained] = useState<number | null>(null);

  const xpStats = useMemo(() => calculateLevelStats(totalXp, habits), [totalXp, habits]);

  const handleUpdateSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleUpdateNotifications = (newNotifs: ReminderNotification[]) => {
    setNotifications(newNotifs);
    saveStoredNotifications(newNotifs);
  };

  const handleTriggerToast = (notif: ReminderNotification) => {
    setActiveToastNotification(notif);
  };

  // Auto-dismiss toast notification after 6 seconds
  useEffect(() => {
    if (activeToastNotification) {
      const timer = setTimeout(() => {
        setActiveToastNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToastNotification]);

  // Daily & Hourly Reminder Scheduler Engine: checks every 15 seconds against scheduled reminder times
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      // 1. Daily Reminder Check (at scheduled time e.g. 20:00)
      if (
        reminderSettings.enabled &&
        currentTimeStr === reminderSettings.scheduledTime &&
        reminderSettings.lastNotifiedDate !== todayDateStr
      ) {
        const { notification } = triggerDailyReminder(habits, reminderSettings);
        if (notification) {
          setActiveToastNotification(notification);
          setNotifications((prev) => [notification, ...prev]);
          const updatedSettings = {
            ...reminderSettings,
            lastNotifiedDate: todayDateStr,
          };
          setReminderSettings(updatedSettings);
          saveStoredSettings(updatedSettings);
        }
      }

      // 2. Hourly Reminder Check (every 1 hour)
      if (reminderSettings.hourlyEnabled) {
        const intervalHours = reminderSettings.hourlyIntervalHours || 1;
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const lastHourly = reminderSettings.lastHourlyNotifiedTimestamp || 0;

        if (!lastHourly) {
          // Initialize timestamp so first automated hourly reminder fires after 1 full interval
          const updatedSettings = {
            ...reminderSettings,
            lastHourlyNotifiedTimestamp: nowMs,
          };
          setReminderSettings(updatedSettings);
          saveStoredSettings(updatedSettings);
        } else if (nowMs - lastHourly >= intervalMs) {
          const { notification } = triggerHourlyReminder(habits, reminderSettings);
          if (notification) {
            setActiveToastNotification(notification);
            setNotifications((prev) => [notification, ...prev]);
            const updatedSettings = {
              ...reminderSettings,
              lastHourlyNotifiedTimestamp: nowMs,
            };
            setReminderSettings(updatedSettings);
            saveStoredSettings(updatedSettings);
          }
        }
      }
    };

    // Run check immediately and every 15 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 15000);
    return () => clearInterval(interval);
  }, [habits, reminderSettings]);

  const navigateTo = (screen: ScreenId, transition: TransitionType) => {
    setTransitionType(transition);
    setCurrentScreen(screen);
  };

  const handleToggleHabit = (id: string) => {
    const targetHabit = habits.find((h) => h.id === id);
    if (targetHabit) {
      const willBeCompleted = !targetHabit.completed;
      if (willBeCompleted) {
        setTotalXp((prev) => {
          const next = prev + XP_PER_HABIT;
          saveStoredTotalXp(next);
          return next;
        });
        setRecentXpGained(XP_PER_HABIT);
        setTimeout(() => setRecentXpGained(null), 2500);
      } else {
        setTotalXp((prev) => {
          const next = Math.max(0, prev - XP_PER_HABIT);
          saveStoredTotalXp(next);
          return next;
        });
      }
    }

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const isNowCompleted = !habit.completed;
        return {
          ...habit,
          completed: isNowCompleted,
          // If uncompleting, clear today's mood
          todayMood: isNowCompleted ? habit.todayMood : undefined,
          todayMoodNote: isNowCompleted ? habit.todayMoodNote : undefined,
          todayMoodLoggedAt: isNowCompleted ? habit.todayMoodLoggedAt : undefined,
        };
      })
    );
  };

  const handleLogMood = (habitId: string, mood: MoodId, note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const updatedMoodEntries = [
          ...(habit.moodEntries || []).filter((e) => e.date !== dateStr),
          { date: dateStr, mood, note, loggedAt: timeStr },
        ];
        return {
          ...habit,
          todayMood: mood,
          todayMoodNote: note,
          todayMoodLoggedAt: timeStr,
          moodEntries: updatedMoodEntries,
        };
      })
    );
  };

  const handleRemoveMood = (habitId: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        return {
          ...habit,
          todayMood: undefined,
          todayMoodNote: undefined,
          todayMoodLoggedAt: undefined,
          moodEntries: (habit.moodEntries || []).filter((e) => e.date !== dateStr),
        };
      })
    );
  };

  const handleSaveHabit = (newHabit: Habit) => {
    setHabits((prev) => [newHabit, ...prev]);
    // As per navigation spec: Save Habit -> HabitFlow - Home Dashboard (push_back transition)
    navigateTo('home', 'push_back');
  };

  // Determine motion variants based on transitionType
  const getVariants = () => {
    switch (transitionType) {
      case 'push':
        return {
          initial: { x: '100%', opacity: 0.95 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-30%', opacity: 0.9 },
          transition: { duration: 0.32, ease: 'easeOut' as const },
        };
      case 'push_back':
        return {
          initial: { x: '-30%', opacity: 0.9 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '100%', opacity: 0.95 },
          transition: { duration: 0.32, ease: 'easeOut' as const },
        };
      case 'slide_up':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { type: 'spring' as const, damping: 30, stiffness: 320 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <ThemeProvider>
      <div className="relative bg-slate-950 flex items-center justify-center min-h-screen p-0 sm:p-4 text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-800 overflow-hidden">
      {/* Mindful Ambient Soft Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[750px] bg-slate-900/50 rounded-full blur-2xl" />
      </div>

      {/* Mobile Device Frame with Mindful Glassmorphism */}
      <div
        id="app-device-frame"
        className="w-full max-w-[400px] h-screen sm:h-[844px] bg-[#F8FAFC]/85 dark:bg-slate-900/95 dark:text-slate-100 backdrop-blur-xl backdrop-saturate-150 flex flex-col justify-between relative shadow-2xl shadow-slate-950/40 overflow-hidden sm:rounded-[48px] sm:border-[8px] sm:border-slate-800/90 dark:sm:border-slate-700/80 sm:ring-1 sm:ring-white/20 transition-colors duration-200"
        data-purpose="mobile-device"
      >
        <AnimatePresence mode="wait" initial={false}>
          {currentScreen === 'onboarding' && (
            <motion.div
              key="screen-onboarding"
              className="w-full h-full absolute inset-0"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={variants.transition}
            >
              <OnboardingScreen
                onNavigateHome={() => navigateTo('home', 'push')}
              />
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="screen-home"
              className="w-full h-full absolute inset-0"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={variants.transition}
            >
              <HomeScreen
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onNavigateAnalytics={() => navigateTo('analytics', 'none')}
                onNavigateAddHabit={() => navigateTo('add-habit', 'slide_up')}
                reminderSettings={reminderSettings}
                notifications={notifications}
                onUpdateSettings={handleUpdateSettings}
                onUpdateNotifications={handleUpdateNotifications}
                onTriggerToast={handleTriggerToast}
                onLogMood={handleLogMood}
                onRemoveMood={handleRemoveMood}
                xpStats={xpStats}
                recentXpGained={recentXpGained}
              />
            </motion.div>
          )}

          {currentScreen === 'add-habit' && (
            <motion.div
              key="screen-add-habit"
              className="w-full h-full absolute inset-0 z-30"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={variants.transition}
            >
              <AddHabitScreen
                onSaveHabit={handleSaveHabit}
                onNavigateHome={() => navigateTo('home', 'push_back')}
              />
            </motion.div>
          )}

          {currentScreen === 'analytics' && (
            <motion.div
              key="screen-analytics"
              className="w-full h-full absolute inset-0"
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={variants.transition}
            >
              <AnalyticsScreen
                habits={habits}
                onNavigateHome={() => navigateTo('home', 'none')}
                onNavigateAddHabit={() => navigateTo('add-habit', 'slide_up')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-App Floating Daily Reminder Notification Toast */}
        <NotificationToast
          notification={activeToastNotification}
          onClose={() => setActiveToastNotification(null)}
          onQuickComplete={handleToggleHabit}
        />
      </div>
    </div>
    </ThemeProvider>
  );
}
