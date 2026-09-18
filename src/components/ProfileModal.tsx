import { useMemo } from 'react';
import { X, Trophy, Flame, CheckCircle, Award, Sparkles, Moon } from 'lucide-react';
import { Habit, calculateHabitStreak, getActiveMilestones } from '../types';
import Milestones from './Milestones';
import ThemeToggle from './ThemeToggle';

interface ProfileModalProps {
  habits: Habit[];
  onClose: () => void;
}

export default function ProfileModal({ habits, onClose }: ProfileModalProps) {
  const milestones = useMemo(() => getActiveMilestones(habits), [habits]);

  const bestStreak = useMemo(() => {
    return habits.length > 0
      ? Math.max(0, ...habits.map((h) => calculateHabitStreak(h.completionHistory, h.completed)))
      : 0;
  }, [habits]);

  const unlockedMilestones = useMemo(
    () => milestones.filter((m) => m.unlocked).length,
    [milestones]
  );

  const completedTodayCount = habits.filter((h) => h.completed).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center"
      onClick={onClose}
      data-purpose="profile-and-badges-modal"
    >
      <div
        className="bg-[#F8FAFC] dark:bg-slate-900 w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-white dark:bg-slate-850 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile & Milestones</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {/* User Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 shadow-sm border border-slate-100/90 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-200 dark:shadow-emerald-950">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-2xl">
                  🧘‍♂️
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Madhan Mathew</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    Master
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Daily Habit Builder • Since 2026</p>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> {bestStreak}-Day Top Streak Active
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preferences Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 shadow-sm border border-slate-100/90 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">App Appearance</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Mindful light or deep dark mode</p>
                </div>
              </div>
            </div>
            <ThemeToggle variant="expanded" />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-slate-100/90 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                <Flame className="w-3 h-3 text-amber-500" /> Best Streak
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{bestStreak} <span className="text-xs font-normal text-slate-400">days</span></div>
            </div>
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-slate-100/90 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                <Trophy className="w-3 h-3 text-yellow-500" /> Badges
              </div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {unlockedMilestones} <span className="text-xs font-normal text-slate-400">/ {milestones.length}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-slate-100/90 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> Today
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {completedTodayCount} <span className="text-xs font-normal text-slate-400">/ {habits.length}</span>
              </div>
            </div>
          </div>

          {/* Milestones Showcase */}
          <Milestones habits={habits} variant="profile" />
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-850 px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-98 transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
