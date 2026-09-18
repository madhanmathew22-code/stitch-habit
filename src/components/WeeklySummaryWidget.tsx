import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Trophy,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Habit } from '../types';
import { getHabitIconDefinition } from './habitIconsData';
import HabitIconDisplay from './HabitIconDisplay';

interface WeeklySummaryWidgetProps {
  habits: Habit[];
  className?: string;
}

interface DayStat {
  date: Date;
  dayName: string;
  dayShort: string;
  dateStr: string;
  diffDays: number;
  completedCount: number;
  totalHabits: number;
  rate: number;
  isBestDay?: boolean;
}

interface HabitWeeklyStat {
  habit: Habit;
  completedDays: number;
  totalDays: number;
  rate: number;
  targetMet: boolean;
  targetTimes?: number;
}

export default function WeeklySummaryWidget({
  habits,
  className = '',
}: WeeklySummaryWidgetProps) {
  // Reference today: September 18, 2026 (Friday)
  const todayRef = useMemo(() => new Date(2026, 8, 18), []);

  // Week offset: 1 = previous week (default), 2 = 2 weeks ago, 0 = current week
  const [weekOffset, setWeekOffset] = useState<number>(1);
  const [showHabitBreakdown, setShowHabitBreakdown] = useState<boolean>(true);

  // Helper to determine habit status on any given date
  const getHabitStatusForDate = (habit: Habit, date: Date): boolean => {
    const diffTime = todayRef.getTime() - date.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return Boolean(habit.completed);
    }
    if (diffDays > 0) {
      const history = habit.completionHistory || [];
      const historyIndex = history.length - diffDays;
      if (historyIndex >= 0 && historyIndex < history.length) {
        return Boolean(history[historyIndex]);
      }
      // Consistent fallback for habits with fewer history entries
      const seed =
        date.getFullYear() * 1000 +
        (date.getMonth() + 1) * 50 +
        date.getDate() +
        habit.name.length;
      return seed % 4 !== 0;
    }
    return false;
  };

  // Compute the 7 dates for the selected week offset
  // By standard ISO-8601 / calendar week: Monday to Sunday
  // If today is Friday Sep 18, 2026:
  // Current week Monday is Sep 14, 2026
  // Previous week (weekOffset = 1) is Monday Sep 7 to Sunday Sep 13, 2026
  const weekData = useMemo(() => {
    // Determine Monday of current week
    const currentDayOfWeek = todayRef.getDay(); // 0 is Sunday, 5 is Friday
    // Distance from current day to this week's Monday
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const currentMonday = new Date(todayRef);
    currentMonday.setDate(todayRef.getDate() - daysSinceMonday);

    // Target week's Monday
    const targetMonday = new Date(currentMonday);
    targetMonday.setDate(currentMonday.getDate() - weekOffset * 7);

    // Build the 7 days (Monday through Sunday)
    const days: DayStat[] = [];
    let totalCompletedSessions = 0;
    let totalPossibleSessions = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(targetMonday);
      d.setDate(targetMonday.getDate() + i);

      const diffTime = todayRef.getTime() - d.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let completedCount = 0;
      habits.forEach((habit) => {
        if (getHabitStatusForDate(habit, d)) {
          completedCount++;
        }
      });

      const totalHabits = Math.max(1, habits.length);
      const rate = Math.round((completedCount / totalHabits) * 100);

      totalCompletedSessions += completedCount;
      totalPossibleSessions += habits.length;

      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayShort: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        diffDays,
        completedCount,
        totalHabits: habits.length,
        rate,
      });
    }

    // Find the best day of this week
    const maxRate = Math.max(...days.map((d) => d.rate));
    days.forEach((d) => {
      if (d.rate === maxRate && maxRate > 0) {
        d.isBestDay = true;
      }
    });

    // Average completion percentage across all habits for this week
    const averageCompletion =
      totalPossibleSessions > 0
        ? Math.round((totalCompletedSessions / totalPossibleSessions) * 100)
        : 0;

    // Start & End dates formatting
    const startDateStr = days[0].date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endDateStr = days[6].date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const rangeLabel = `${startDateStr} – ${endDateStr}`;

    // Habit-by-habit weekly summary
    const habitStats: HabitWeeklyStat[] = habits.map((habit) => {
      let completedDays = 0;
      days.forEach((day) => {
        if (getHabitStatusForDate(habit, day.date)) {
          completedDays++;
        }
      });

      const rate = Math.round((completedDays / 7) * 100);
      let targetMet = false;
      let targetTimes: number | undefined;

      if (habit.targetFrequency) {
        if (habit.targetFrequency.mode === 'times_per_week') {
          targetTimes = habit.targetFrequency.timesPerPeriod;
          targetMet = completedDays >= targetTimes;
        } else if (habit.targetFrequency.mode === 'everyday') {
          targetTimes = 7;
          targetMet = completedDays >= 7;
        } else if (habit.targetFrequency.mode === 'specific_days') {
          targetTimes = habit.targetFrequency.daysOfWeek?.length || 3;
          targetMet = completedDays >= targetTimes;
        } else {
          targetTimes = 1;
          targetMet = completedDays >= 1;
        }
      } else {
        // Default target is daily or at least 5 days/week
        targetTimes = 5;
        targetMet = completedDays >= 5;
      }

      return {
        habit,
        completedDays,
        totalDays: 7,
        rate,
        targetMet,
        targetTimes,
      };
    });

    // Sort habits: highest rate first
    habitStats.sort((a, b) => b.rate - a.rate);

    return {
      days,
      averageCompletion,
      totalCompletedSessions,
      totalPossibleSessions,
      rangeLabel,
      habitStats,
      bestDay: days.find((d) => d.isBestDay),
    };
  }, [habits, weekOffset, todayRef]);

  // Compute prior week data for comparison delta (e.g. weekOffset + 1)
  const priorWeekAverage = useMemo(() => {
    const priorOffset = weekOffset + 1;
    const currentDayOfWeek = todayRef.getDay();
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const currentMonday = new Date(todayRef);
    currentMonday.setDate(todayRef.getDate() - daysSinceMonday);

    const priorMonday = new Date(currentMonday);
    priorMonday.setDate(currentMonday.getDate() - priorOffset * 7);

    let completedSessions = 0;
    let possibleSessions = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(priorMonday);
      d.setDate(priorMonday.getDate() + i);

      habits.forEach((habit) => {
        if (getHabitStatusForDate(habit, d)) {
          completedSessions++;
        }
      });
      possibleSessions += habits.length;
    }

    return possibleSessions > 0
      ? Math.round((completedSessions / possibleSessions) * 100)
      : 0;
  }, [habits, weekOffset, todayRef]);

  const diffFromPrior = weekData.averageCompletion - priorWeekAverage;

  // Title label based on week offset
  const getWeekTitle = () => {
    if (weekOffset === 1) return 'Previous Week Summary';
    if (weekOffset === 0) return 'Current Week (To-Date)';
    if (weekOffset === 2) return '2 Weeks Ago Summary';
    return `${weekOffset} Weeks Ago Summary`;
  };

  // Performance status badge
  const getPerformanceDescriptor = (rate: number) => {
    if (rate >= 85) return { text: 'Outstanding', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800' };
    if (rate >= 70) return { text: 'Solid Consistency', color: 'text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800' };
    if (rate >= 50) return { text: 'Building Momentum', color: 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800' };
    return { text: 'Refocus Needed', color: 'text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800' };
  };

  const statusDescriptor = getPerformanceDescriptor(weekData.averageCompletion);

  return (
    <section
      id="weekly-summary-widget"
      data-purpose="weekly-summary-widget"
      className={`bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100/90 dark:border-slate-700/80 space-y-4 transition-colors ${className}`}
    >
      {/* Header: Title, Week Navigator & Range */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {getWeekTitle()}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
              {weekData.rangeLabel}
            </p>
          </div>
        </div>

        {/* Week Navigator Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl">
          <button
            type="button"
            id="weekly-summary-prev-week-btn"
            aria-label="Previous week"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
            title="Go further back in time"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="weekly-summary-reset-btn"
            onClick={() => setWeekOffset(1)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              weekOffset === 1
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Prev Wk
          </button>

          <button
            type="button"
            id="weekly-summary-next-week-btn"
            aria-label="Next week"
            disabled={weekOffset <= 0}
            onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Go forward in time"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main KPI Banner: Big Average Completion Percentage */}
      <div
        className="p-4 rounded-2xl bg-linear-to-br from-slate-50 via-slate-50/60 to-emerald-50/30 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-emerald-950/20 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-4"
        data-purpose="weekly-average-kpi-banner"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Completion
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusDescriptor.color}`}
            >
              {statusDescriptor.text}
            </span>
          </div>

          {/* Large percentage display with trend comparison */}
          <div className="flex items-baseline gap-2.5">
            <span
              id="weekly-average-percentage-val"
              className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none"
            >
              {weekData.averageCompletion}%
            </span>

            {/* Delta vs prior week */}
            <div
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                diffFromPrior > 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  : diffFromPrior < 0
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {diffFromPrior > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+{diffFromPrior}%</span>
                </>
              ) : diffFromPrior < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>{diffFromPrior}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3" />
                  <span>0%</span>
                </>
              )}
              <span className="text-[9px] font-medium opacity-80 ml-0.5">vs prior</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong>{weekData.totalCompletedSessions}</strong> of{' '}
            <strong>{weekData.totalPossibleSessions}</strong> habit sessions completed across all habits
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-emerald-500 transition-all duration-700 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${weekData.averageCompletion}, 100`}
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              7 Days
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Completion Mini Strip (Mon to Sun of that week) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Daily Completion Breakdown
          </span>
          {weekData.bestDay && (
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              Peak: {weekData.bestDay.dayName} ({weekData.bestDay.rate}%)
            </span>
          )}
        </div>

        {/* 7 columns representing each day of the previous week */}
        <div
          className="grid grid-cols-7 gap-1.5 text-center"
          data-purpose="weekly-days-strip"
        >
          {weekData.days.map((day, idx) => {
            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                  day.isBestDay
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 shadow-2xs'
                    : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700/70'
                }`}
                title={`${day.dayName}, ${day.dateStr}: ${day.completedCount}/${day.totalHabits} habits (${day.rate}%)`}
              >
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  {day.dayName}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">
                  {day.date.getDate()}
                </span>

                {/* Mini vertical progress bar */}
                <div className="w-2.5 h-10 bg-slate-200/80 dark:bg-slate-700 rounded-full my-1.5 overflow-hidden flex flex-col justify-end">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      day.rate === 100
                        ? 'bg-emerald-500'
                        : day.rate >= 70
                        ? 'bg-blue-500'
                        : day.rate >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-400'
                    }`}
                    style={{ height: `${day.rate}%` }}
                  />
                </div>

                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {day.rate}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Weekly Highlights Pill Row */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        {/* Most Consistent Habit */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block truncate">
              Top Weekly Habit
            </span>
            <span className="font-bold text-slate-900 dark:text-white truncate block text-[11px]">
              {weekData.habitStats[0]?.habit.name || 'All Habits'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {weekData.habitStats[0]?.completedDays || 0}/7 days ({weekData.habitStats[0]?.rate || 0}%)
            </span>
          </div>
        </div>

        {/* Goals Target Met */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-slate-400 block truncate">
              Weekly Targets Met
            </span>
            <span className="font-bold text-slate-900 dark:text-white truncate block text-[11px]">
              {weekData.habitStats.filter((h) => h.targetMet).length} of {weekData.habitStats.length} Habits
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              {Math.round(
                (weekData.habitStats.filter((h) => h.targetMet).length /
                  Math.max(1, weekData.habitStats.length)) *
                  100
              )}
              % compliance
            </span>
          </div>
        </div>
      </div>

      {/* Habit-by-Habit Completion Performance Breakdown */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setShowHabitBreakdown((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 py-1 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Habit Breakdown ({weekData.habitStats.length})
          </span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
            {showHabitBreakdown ? 'Hide' : 'Show'}
          </span>
        </button>

        {showHabitBreakdown && (
          <div
            className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5 animate-in fade-in duration-200"
            data-purpose="weekly-habit-breakdown-list"
          >
            {weekData.habitStats.map(({ habit, completedDays, rate, targetMet, targetTimes }) => {
              const iconDef = getHabitIconDefinition(habit.icon);
              return (
                <div
                  key={habit.id}
                  className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-750/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <HabitIconDisplay iconId={habit.icon} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {habit.name}
                        </span>
                        {targetMet && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                            Target Met
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                        {completedDays}/7 days
                        {targetTimes ? ` • Goal: ${targetTimes}x/wk` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {rate}%
                    </span>
                    <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          rate >= 80
                            ? 'bg-emerald-500'
                            : rate >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
