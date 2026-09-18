import { useState, useMemo } from 'react';
import StatusBar from './StatusBar';
import HomeIndicator from './HomeIndicator';
import Habit from './Habit';
import Milestones from './Milestones';
import ProfileModal from './ProfileModal';
import NotificationCenterModal from './NotificationCenterModal';
import MoodLogModal from './MoodLogModal';
import HabitSortDropdown from './HabitSortDropdown';
import DailyAffirmationWidget from './DailyAffirmationWidget';
import ThemeToggle from './ThemeToggle';
import {
  Habit as HabitType,
  ReminderNotification,
  ReminderSettings,
  MoodId,
  HabitSortOption,
  calculateHabitStreak,
} from '../types';
import { getMoodOption } from '../utils/moodHelpers';

interface HomeScreenProps {
  habits: HabitType[];
  onToggleHabit: (id: string) => void;
  onNavigateAnalytics: () => void;
  onNavigateAddHabit: () => void;
  reminderSettings: ReminderSettings;
  notifications: ReminderNotification[];
  onUpdateSettings: (settings: ReminderSettings) => void;
  onUpdateNotifications: (notifications: ReminderNotification[]) => void;
  onTriggerToast: (notif: ReminderNotification) => void;
  onLogMood?: (habitId: string, mood: MoodId, note?: string) => void;
  onRemoveMood?: (habitId: string) => void;
}

export default function HomeScreen({
  habits,
  onToggleHabit,
  onNavigateAnalytics,
  onNavigateAddHabit,
  reminderSettings,
  notifications,
  onUpdateSettings,
  onUpdateNotifications,
  onTriggerToast,
  onLogMood,
  onRemoveMood,
}: HomeScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedSort, setSelectedSort] = useState<HabitSortOption>('Most Frequent');
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // Sun (today)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [moodPromptHabit, setMoodPromptHabit] = useState<HabitType | null>(null);

  const daysOfWeek = [
    { name: 'Mon', completed: true },
    { name: 'Tue', completed: true },
    { name: 'Wed', completed: true },
    { name: 'Thu', completed: true },
    { name: 'Fri', completed: true },
    { name: 'Sat', completed: true },
    { name: 'Sun', completed: false, isToday: true },
  ];

  const sortedAndFilteredHabits = useMemo(() => {
    // 1. Filter by time of day
    const timeFiltered = habits.filter((habit) => {
      if (selectedFilter === 'all') return true;
      return habit.timeOfDay === selectedFilter || habit.timeOfDay === 'all';
    });

    // 2. Sort by selected sort option
    return [...timeFiltered].sort((a, b) => {
      if (selectedSort === 'Highest Streak') {
        const streakA = calculateHabitStreak(a.completionHistory, a.completed, a.streak);
        const streakB = calculateHabitStreak(b.completionHistory, b.completed, b.streak);
        if (streakB !== streakA) {
          return streakB - streakA; // Higher streak first
        }
        // Secondary tiebreaker: total completions
        const compA = (a.completionHistory?.filter(Boolean).length || 0) + (a.completed ? 1 : 0);
        const compB = (b.completionHistory?.filter(Boolean).length || 0) + (b.completed ? 1 : 0);
        return compB - compA;
      }

      if (selectedSort === 'Most Frequent') {
        // Frequency priority: Daily (3) > Weekly (2) > Custom (1)
        const freqWeight = (h: HabitType) => {
          if (h.frequency === 'Daily' || !h.frequency) return 3;
          if (h.frequency === 'Weekly') return 2;
          return 1;
        };
        const weightDiff = freqWeight(b) - freqWeight(a);
        if (weightDiff !== 0) return weightDiff;

        // Total completions / logged consistency
        const compA = (a.completionHistory?.filter(Boolean).length || 0) + (a.completed ? 1 : 0);
        const compB = (b.completionHistory?.filter(Boolean).length || 0) + (b.completed ? 1 : 0);
        if (compB !== compA) return compB - compA;

        return a.name.localeCompare(b.name);
      }

      if (selectedSort === 'Recent') {
        // Recent: newest created or latest added habits first
        const getTimestamp = (h: HabitType, indexFallback: number) => {
          if (typeof h.createdAt === 'number') return h.createdAt;
          const match = h.id.match(/^habit-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > 1000000000) return num; // Real timestamp from Date.now()
            return 1000 + num; // Sequence ID
          }
          return indexFallback;
        };

        const idxA = habits.indexOf(a);
        const idxB = habits.indexOf(b);
        const timeA = getTimestamp(a, idxA);
        const timeB = getTimestamp(b, idxB);

        return timeB - timeA; // Descending: newer first
      }

      return 0;
    });
  }, [habits, selectedFilter, selectedSort]);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const incompleteCount = habits.filter((h) => !h.completed).length;

  const todayLoggedMoods = habits
    .filter((h) => h.completed && h.todayMood)
    .map((h) => {
      const opt = getMoodOption(h.todayMood);
      return {
        habitId: h.id,
        habitName: h.name,
        mood: opt,
      };
    })
    .filter((m) => m.mood !== undefined);

  const handleHabitToggleWithMood = (id: string) => {
    const target = habits.find((h) => h.id === id);
    onToggleHabit(id);
    if (target && !target.completed) {
      // Habit is transitioning from incomplete to complete: prompt user for mood reflection!
      setMoodPromptHabit({ ...target, completed: true });
    }
  };

  const formatTimeDisplay = (time24: string) => {
    if (!time24) return '8:00 PM';
    const [hoursStr, minsStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minsStr} ${ampm}`;
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC]/80 dark:bg-slate-900/90 backdrop-blur-md flex flex-col justify-between relative overflow-hidden select-none transition-colors duration-200">
      <StatusBar />

      {/* MainContentScrollableArea */}
      <main className="flex-1 overflow-y-auto px-5 pt-3 pb-24 no-scrollbar">
        {/* UserGreetingHeader */}
        <section className="flex items-start justify-between mb-2.5" data-purpose="user-header">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Good Morning, Madhan! <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Let’s cultivate mindful consistency today
            </p>
          </div>

          {/* Theme, Notifications & Profile Controls */}
          <div className="flex items-center space-x-2 shrink-0 pt-0.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Bell */}
            <button
              id="home-notifications-bell-btn"
              aria-label="Daily reminders and notifications"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-2 rounded-full bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer active:scale-95"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              ) : reminderSettings.enabled ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              ) : null}
            </button>

            {/* User Avatar */}
            <button
              id="home-profile-avatar-btn"
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Open profile and milestones trophy room"
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-500/20 dark:ring-emerald-500/40 shadow-sm bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:ring-emerald-500/50 transition cursor-pointer active:scale-95"
            >
              <span className="text-sm">🧘‍♂️</span>
            </button>
          </div>
        </section>

        {/* Daily Affirmation Mindful Widget */}
        <DailyAffirmationWidget />

        {/* Reminder Schedule Status Pill */}
        {reminderSettings.enabled && (
          <button
            type="button"
            onClick={() => setIsNotificationCenterOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 mb-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-2xs transition cursor-pointer text-left group"
            data-purpose="reminder-quick-status"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">⏰</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                Daily Reminder set for {formatTimeDisplay(reminderSettings.scheduledTime)}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              incompleteCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
            }`}>
              {incompleteCount > 0 ? `${incompleteCount} pending` : 'All complete'}
            </span>
          </button>
        )}

        {/* Today's Emotional Mood Pulse Strip */}
        {todayLoggedMoods.length > 0 && (
          <div
            className="w-full flex items-center justify-between px-3.5 py-2 mb-3 bg-linear-to-r from-teal-50/80 via-white to-emerald-50/80 dark:from-teal-950/40 dark:via-slate-800/80 dark:to-emerald-950/40 rounded-xl border border-teal-100/80 dark:border-teal-900/40 shadow-2xs transition"
            data-purpose="today-mood-pulse"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs shrink-0">✨</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0 uppercase tracking-wider">
                Today’s Moods:
              </span>
              <div className="flex items-center gap-1">
                {todayLoggedMoods.map((m, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${m.mood!.badgeBg}`}
                    title={`${m.habitName}: ${m.mood!.label}`}
                  >
                    <span>{m.mood!.emoji}</span>
                    <span className="truncate max-w-[65px]">{m.mood!.label}</span>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateAnalytics}
              className="text-[10px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline shrink-0 ml-1 cursor-pointer"
            >
              Stats →
            </button>
          </div>
        )}

        {/* WeeklyCalendarStrip */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 mb-4 shadow-sm border border-slate-100 dark:border-slate-700" data-purpose="week-calendar">
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              const isChecked = day.completed || (day.isToday && completedCount >= 4);

              return (
                <button
                  key={day.name}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950'
                        : isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    {isChecked ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium ${day.isToday ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {day.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* TodayProgressCard */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-700" data-purpose="progress-card">
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today's Progress</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {completedCount}/{totalCount} habits completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{progressPercent}%</span>
            </div>
          </div>
          {/* Progress Bar Background & Active Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </section>

        {/* Streak Milestones & Badges Widget */}
        <Milestones
          habits={habits}
          variant="home"
          onViewAll={() => setIsProfileOpen(true)}
        />

        {/* FilterTabs */}
        <section className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar py-0.5" data-purpose="habit-filters">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
              selectedFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950'
                : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('morning')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition ${
              selectedFilter === 'morning'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950'
                : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Morning
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('afternoon')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition ${
              selectedFilter === 'afternoon'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950'
                : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Afternoon
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('evening')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition ${
              selectedFilter === 'evening'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950'
                : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Evening
          </button>
        </section>

        {/* Habit Controls Header: Habit Count & Sorting Dropdown */}
        <div className="flex items-center justify-between mb-3 px-1" data-purpose="habit-list-controls">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedFilter === 'all'
                ? 'All Habits'
                : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Habits`}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
              {sortedAndFilteredHabits.length}
            </span>
          </div>

          <HabitSortDropdown
            currentSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </div>

        {/* HabitList */}
        <section className="space-y-2.5" data-purpose="habits-list">
          {sortedAndFilteredHabits.map((habit) => (
            <Habit
              key={habit.id}
              habit={habit}
              onToggle={handleHabitToggleWithMood}
              onOpenMoodLog={(target) => setMoodPromptHabit(target)}
            />
          ))}

          {sortedAndFilteredHabits.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              No habits found for this time of day.
            </div>
          )}
        </section>
      </main>

      {/* BottomNavigationBar */}
      <nav
        className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 py-2.5 px-6 flex justify-between items-center z-30 shadow-lg transition-colors"
        data-purpose="bottom-nav"
      >
        {/* Home (Active) */}
        <button
          className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </button>

        {/* Stats */}
        <button
          id="home-stats-btn"
          onClick={onNavigateAnalytics}
          className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium mt-1">Stats</span>
        </button>

        {/* Add Action (Elevated Floating Action Button) */}
        <div className="-mt-6">
          <button
            id="home-add-habit-fab"
            aria-label="Add Habit"
            onClick={onNavigateAddHabit}
            className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition active:scale-95 cursor-pointer"
            type="button"
          >
            <svg className="w-6 h-6 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Community */}
        <button
          className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium mt-1">Community</span>
        </button>

        {/* Profile */}
        <button
          id="home-profile-btn"
          onClick={() => setIsProfileOpen(true)}
          className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </nav>

      {/* Full Profile & Milestones Trophy Room Modal */}
      {isProfileOpen && (
        <ProfileModal
          habits={habits}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Notification Center & Reminder Settings Modal */}
      {isNotificationCenterOpen && (
        <NotificationCenterModal
          habits={habits}
          settings={reminderSettings}
          notifications={notifications}
          onUpdateSettings={onUpdateSettings}
          onUpdateNotifications={onUpdateNotifications}
          onToggleHabit={onToggleHabit}
          onClose={() => setIsNotificationCenterOpen(false)}
          onTriggerToast={onTriggerToast}
        />
      )}

      {/* Mood Log Modal for Emotional Context */}
      {moodPromptHabit && (
        <MoodLogModal
          habit={moodPromptHabit}
          onSaveMood={(habitId, mood, note) => {
            if (onLogMood) {
              onLogMood(habitId, mood, note);
            }
            setMoodPromptHabit(null);
          }}
          onRemoveMood={(habitId) => {
            if (onRemoveMood) {
              onRemoveMood(habitId);
            }
            setMoodPromptHabit(null);
          }}
          onClose={() => setMoodPromptHabit(null)}
        />
      )}

      <HomeIndicator />
    </div>
  );
}
