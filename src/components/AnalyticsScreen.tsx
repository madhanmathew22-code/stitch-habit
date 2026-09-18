import { useState } from 'react';
import StatusBar from './StatusBar';
import HomeIndicator from './HomeIndicator';
import HabitCompletionChart from './HabitCompletionChart';
import WeeklyHabitsBarChart from './WeeklyHabitsBarChart';
import MonthlyConsistencyCalendar from './MonthlyConsistencyCalendar';
import WeeklySummaryWidget from './WeeklySummaryWidget';
import ProfileModal from './ProfileModal';
import MoodAnalyticsSection from './MoodAnalyticsSection';
import HabitJourneyTimeline from './HabitJourneyTimeline';
import StreakMoodCorrelationChart from './StreakMoodCorrelationChart';
import { Habit, calculateHabitStreak } from '../types';
import { getHabitIconDefinition } from './habitIconsData';

interface AnalyticsScreenProps {
  habits?: Habit[];
  onNavigateHome: () => void;
  onNavigateAddHabit: () => void;
}

export default function AnalyticsScreen({
  habits = [],
  onNavigateHome,
  onNavigateAddHabit,
}: AnalyticsScreenProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const maxStreak = habits.length > 0
    ? Math.max(...habits.map((h) => calculateHabitStreak(h.completionHistory, h.completed)))
    : 12;

  const completedTodayCount = habits.filter((h) => h.completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 78;

  const sortedHabits = [...habits]
    .map((habit) => {
      const history = habit.completionHistory || [];
      const totalDays = history.length + 1;
      const completedDays = history.filter(Boolean).length + (habit.completed ? 1 : 0);
      const rate = Math.min(100, Math.round((completedDays / totalDays) * 100));
      return { habit, rate };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  const getBarColor = (icon: string) => {
    const def = getHabitIconDefinition(icon);
    return { bg: def.bgColor, text: def.textColor, bar: def.activeBg };
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC]/80 dark:bg-slate-900 backdrop-blur-md flex flex-col justify-between relative overflow-hidden select-none transition-colors">
      <StatusBar />

      {/* MainContentScrollable */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-24 space-y-4">
        {/* Top Title */}
        <section className="pt-1" data-purpose="page-header">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Progress</h1>
        </section>

        {/* TimeframeTabs */}
        <nav className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner text-xs font-semibold" data-purpose="timeframe-selector">
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-150 cursor-pointer ${
              timeframe === 'weekly'
                ? 'bg-[#2F80ED] text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('monthly')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-150 cursor-pointer ${
              timeframe === 'monthly'
                ? 'bg-[#2F80ED] text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('yearly')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-150 cursor-pointer ${
              timeframe === 'yearly'
                ? 'bg-[#2F80ED] text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Yearly
          </button>
        </nav>

        {/* KPICardsRow */}
        <section className="grid grid-cols-2 gap-3" data-purpose="kpi-metrics">
          {/* Completion Rate Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-sm border border-slate-100/80 dark:border-slate-700 flex items-center space-x-3">
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-100 dark:text-emerald-950/60"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#27AE60]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{completionRate}%</span>
              </div>
            </div>
            {/* Label & Stat */}
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-400 font-medium leading-tight">Today's Rate</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{completionRate}%</span>
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-sm border border-slate-100/80 dark:border-slate-700 flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#F2994A] fill-current" viewBox="0 0 24 24">
                <path d="M12.44 2.1c-.4-.36-.99-.3-1.32.13-.24.31-.69.96-1.12 1.67-1.42 2.33-2.6 5.16-1.74 8.1.1.34-.14.68-.49.71-.35.03-.68-.19-.73-.54-.15-1.04-.15-2.07-.02-3.04.04-.3-.15-.59-.44-.67-.29-.08-.6.06-.72.34C4.85 10.9 4 13.4 4 16c0 4.42 3.58 8 8 8s8-3.58 8-8c0-3.92-1.95-7.42-4.47-9.84-1.29-1.24-2.53-2.92-3.09-4.06z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-400 font-medium leading-tight">Best Streak</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 whitespace-nowrap">
                {maxStreak} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Summary Widget (Calculates average completion percentage across all habits for the previous week) */}
        <WeeklySummaryWidget habits={habits} />

        {/* Recharts Bar Chart (Past 7 Days) */}
        <WeeklyHabitsBarChart habits={habits} />

        {/* Monthly Consistency Calendar (Highlighting All Goals Met) */}
        <MonthlyConsistencyCalendar habits={habits} />

        {/* Recharts Habit Completion Chart (Last 30 Days) */}
        <HabitCompletionChart habits={habits} />

        {/* Habit Journey Timeline (Vertical scrollable list of completed milestones & significant streaks) */}
        <HabitJourneyTimeline habits={habits} />

        {/* TopHabitsList */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100/80 dark:border-slate-700 space-y-3.5" data-purpose="top-habits">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Top Habits</h2>
            <span className="text-[11px] text-slate-400 font-medium">By 30-day rate</span>
          </div>

          {sortedHabits.map(({ habit, rate }) => {
            const colors = getBarColor(habit.icon);
            const iconDef = getHabitIconDefinition(habit.icon);
            return (
              <article key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                      <span className="text-xs">
                        {iconDef.emoji}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{habit.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{rate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`${colors.bar} h-full rounded-full transition-all duration-300`} style={{ width: `${rate}%` }}></div>
                </div>
              </article>
            );
          })}
        </section>

        {/* 30-Day Streak & Mood Correlation Recharts Line Chart */}
        <StreakMoodCorrelationChart habits={habits} />

        {/* Emotional Context & Mood Log Analytics Section */}
        <MoodAnalyticsSection habits={habits} timeframe={timeframe} />

        {/* QuoteCard */}
        <footer className="bg-emerald-50/50 dark:bg-emerald-950/40 rounded-2xl py-3 px-4 border border-emerald-100/60 dark:border-emerald-900/60 text-center" data-purpose="motivational-quote">
          <p className="text-xs italic text-slate-700 dark:text-slate-300 font-medium">“Consistency turns goals into reality.”</p>
        </footer>
      </main>

      {/* BottomNavigationBar */}
      <nav
        className="absolute bottom-0 left-0 right-0 h-[72px] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 flex justify-around items-center z-30 transition-colors"
        data-purpose="bottom-tab-bar"
      >
        {/* Home Tab */}
        <button
          id="analytics-home-btn"
          onClick={onNavigateHome}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-600 transition-colors w-12 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Stats Tab (Active) */}
        <button
          className="flex flex-col items-center justify-center space-y-1 text-[#27AE60] w-12 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
          </svg>
          <span className="text-[10px] font-semibold">Stats</span>
        </button>

        {/* Center '+' Action Button */}
        <div className="relative -top-4">
          <button
            id="analytics-add-habit-fab"
            aria-label="Add Habit"
            onClick={onNavigateAddHabit}
            className="w-12 h-12 rounded-full bg-[#2F80ED] text-white flex items-center justify-center shadow-lg shadow-blue-400/40 transform active:scale-95 transition-transform cursor-pointer"
            type="button"
          >
            <svg className="w-6 h-6 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Community Tab */}
        <button
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-600 transition-colors w-12 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="text-[10px] font-medium">Community</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-slate-600 transition-colors w-12 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>

      {/* Profile & Milestones Showcase Modal */}
      {isProfileOpen && (
        <ProfileModal
          habits={habits}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <HomeIndicator />
    </div>
  );
}
