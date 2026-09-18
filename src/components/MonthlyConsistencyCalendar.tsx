import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Check, X } from 'lucide-react';
import { Habit } from '../types';

interface MonthlyConsistencyCalendarProps {
  habits: Habit[];
}

interface DayCellData {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  completedCount: number;
  totalHabits: number;
  isAllGoalsMet: boolean;
  completionRate: number;
  habitStatuses: {
    habit: Habit;
    completed: boolean;
  }[];
}

export default function MonthlyConsistencyCalendar({ habits }: MonthlyConsistencyCalendarProps) {
  // Current reference today is September 18, 2026
  const todayRef = useMemo(() => new Date(2026, 8, 18), []);

  // Selected viewing month/year state (defaults to September 2026)
  const [viewDate, setViewDate] = useState<Date>(() => new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<DayCellData | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-indexed

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
    setSelectedDay(null);
  };

  const handleResetToToday = () => {
    setViewDate(new Date(2026, 8, 1));
    setSelectedDay(null);
  };

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isViewingCurrentMonth = viewYear === todayRef.getFullYear() && viewMonth === todayRef.getMonth();

  // Helper to determine habit status on any given date
  const getHabitStatusForDate = (habit: Habit, date: Date, isTodayDate: boolean, isFutureDate: boolean) => {
    if (isFutureDate) return false;
    if (isTodayDate) return Boolean(habit.completed);

    // Calculate day offset from todayRef (2026-09-18)
    const diffTime = todayRef.getTime() - date.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const history = habit.completionHistory || [];
      const historyIndex = history.length - diffDays;
      if (historyIndex >= 0 && historyIndex < history.length) {
        return Boolean(history[historyIndex]);
      }
      // Deterministic fallback for days earlier than the 29-day array
      const seed = date.getFullYear() * 1000 + (date.getMonth() + 1) * 50 + date.getDate() + habit.name.length;
      return (seed % 5 !== 0);
    }

    return false;
  };

  // Build grid days (including padding from previous and next months for full 7-col grid)
  const calendarDays = useMemo(() => {
    const days: DayCellData[] = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const startWeekday = firstDayOfMonth.getDay(); // 0 for Sunday
    const totalMonthDays = lastDayOfMonth.getDate();

    // 1. Preceding month padding days
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const date = new Date(viewYear, viewMonth - 1, prevMonthLastDay - i);
      const isTodayDate = date.getFullYear() === todayRef.getFullYear() &&
        date.getMonth() === todayRef.getMonth() &&
        date.getDate() === todayRef.getDate();
      const isFutureDate = date.getTime() > todayRef.getTime();

      const habitStatuses = habits.map((h) => ({
        habit: h,
        completed: getHabitStatusForDate(h, date, isTodayDate, isFutureDate),
      }));

      const completedCount = habitStatuses.filter((s) => s.completed).length;
      const total = Math.max(1, habits.length);
      const isAllGoalsMet = habits.length > 0 && completedCount === habits.length && !isFutureDate;

      days.push({
        date,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: isTodayDate,
        isFuture: isFutureDate,
        completedCount,
        totalHabits: habits.length,
        isAllGoalsMet,
        completionRate: Math.round((completedCount / total) * 100),
        habitStatuses,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= totalMonthDays; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const isTodayDate = date.getFullYear() === todayRef.getFullYear() &&
        date.getMonth() === todayRef.getMonth() &&
        date.getDate() === todayRef.getDate();
      const isFutureDate = date.getTime() > todayRef.getTime();

      const habitStatuses = habits.map((h) => ({
        habit: h,
        completed: getHabitStatusForDate(h, date, isTodayDate, isFutureDate),
      }));

      const completedCount = habitStatuses.filter((s) => s.completed).length;
      const total = Math.max(1, habits.length);
      const isAllGoalsMet = habits.length > 0 && completedCount === habits.length && !isFutureDate;

      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: isTodayDate,
        isFuture: isFutureDate,
        completedCount,
        totalHabits: habits.length,
        isAllGoalsMet,
        completionRate: Math.round((completedCount / total) * 100),
        habitStatuses,
      });
    }

    // 3. Next month padding days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(viewYear, viewMonth + 1, day);
      const isTodayDate = date.getFullYear() === todayRef.getFullYear() &&
        date.getMonth() === todayRef.getMonth() &&
        date.getDate() === todayRef.getDate();
      const isFutureDate = date.getTime() > todayRef.getTime();

      const habitStatuses = habits.map((h) => ({
        habit: h,
        completed: getHabitStatusForDate(h, date, isTodayDate, isFutureDate),
      }));

      const completedCount = habitStatuses.filter((s) => s.completed).length;
      const total = Math.max(1, habits.length);
      const isAllGoalsMet = habits.length > 0 && completedCount === habits.length && !isFutureDate;

      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: isTodayDate,
        isFuture: isFutureDate,
        completedCount,
        totalHabits: habits.length,
        isAllGoalsMet,
        completionRate: Math.round((completedCount / total) * 100),
        habitStatuses,
      });
    }

    return days;
  }, [viewYear, viewMonth, habits, todayRef]);

  // Aggregate monthly statistics
  const currentMonthDays = useMemo(() => {
    return calendarDays.filter((d) => d.isCurrentMonth);
  }, [calendarDays]);

  const elapsedDaysInMonth = useMemo(() => {
    return currentMonthDays.filter((d) => !d.isFuture);
  }, [currentMonthDays]);

  const perfectDaysCount = useMemo(() => {
    return elapsedDaysInMonth.filter((d) => d.isAllGoalsMet).length;
  }, [elapsedDaysInMonth]);

  const perfectDaysRate = useMemo(() => {
    if (elapsedDaysInMonth.length === 0) return 0;
    return Math.round((perfectDaysCount / elapsedDaysInMonth.length) * 100);
  }, [perfectDaysCount, elapsedDaysInMonth]);

  // Longest streak of perfect days in this month
  const bestPerfectStreak = useMemo(() => {
    let max = 0;
    let current = 0;
    elapsedDaysInMonth.forEach((d) => {
      if (d.isAllGoalsMet) {
        current++;
        if (current > max) max = current;
      } else {
        current = 0;
      }
    });
    return max;
  }, [elapsedDaysInMonth]);

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <section
      id="monthly-consistency-calendar"
      data-purpose="monthly-consistency-calendar"
      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/80 space-y-3.5"
    >
      {/* Top Header: Title, Month Controls & Today Jump */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              Monthly Consistency
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              All Goals Met
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Highlighting days where 100% of habit goals were achieved
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            id="cal-prev-month-btn"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition active:scale-95 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-800 px-1.5 min-w-[105px] text-center whitespace-nowrap">
            {monthName}
          </span>

          <button
            type="button"
            id="cal-next-month-btn"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition active:scale-95 shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Consistency KPI Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5">
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Perfect Days
          </div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            {perfectDaysCount}
            <span className="text-[11px] font-normal text-emerald-600"> / {elapsedDaysInMonth.length}d</span>
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-2.5">
          <div className="text-[10px] text-slate-500 font-medium">Consistency</div>
          <div className="text-base font-extrabold text-slate-800 mt-0.5">
            {perfectDaysRate}%
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5">
          <div className="text-[10px] text-amber-700 font-semibold">Best Streak</div>
          <div className="text-base font-extrabold text-amber-700 mt-0.5">
            {bestPerfectStreak} <span className="text-[11px] font-normal text-amber-600">days</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="pt-1">
        {/* Weekday Label Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {weekdays.map((day, idx) => (
            <span
              key={`weekday-${idx}`}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* 7-column Date Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth() + 1}-${cell.date.getDate()}`;
            const isSelected = selectedDay && selectedDay.date.toDateString() === cell.date.toDateString();

            // Distinct visual style for "All Goals Met"
            let cellStyle = 'bg-slate-50/60 text-slate-400 border border-transparent';
            let badgeIcon = null;

            if (!cell.isCurrentMonth) {
              cellStyle = 'bg-transparent text-slate-300 opacity-40';
            } else if (cell.isFuture) {
              cellStyle = 'bg-slate-50/40 text-slate-400/80 border border-slate-100/60';
            } else if (cell.isAllGoalsMet) {
              // High-impact highlighted card for perfect habit consistency
              cellStyle = 'bg-emerald-500 text-white font-bold border border-emerald-600 shadow-sm shadow-emerald-200/80 ring-1 ring-emerald-400/40';
              badgeIcon = (
                <span className="text-[9px] leading-none drop-shadow-xs" title="100% Habit Goals Met">
                  ★
                </span>
              );
            } else if (cell.completedCount > 0) {
              // Partial completion
              cellStyle = 'bg-emerald-50/90 text-emerald-900 border border-emerald-200/80';
            } else {
              // 0 completed
              cellStyle = 'bg-slate-100/80 text-slate-500 border border-slate-200/60';
            }

            return (
              <button
                type="button"
                key={`cal-cell-${dateKey}-${idx}`}
                id={`cal-day-${dateKey}`}
                data-purpose="calendar-day-cell"
                onClick={() => setSelectedDay(cell)}
                className={`relative flex flex-col items-center justify-between p-1 rounded-xl aspect-square transition-all duration-150 active:scale-95 cursor-pointer ${cellStyle} ${
                  cell.isToday
                    ? 'ring-2 ring-blue-500 ring-offset-1 font-extrabold'
                    : ''
                } ${
                  isSelected
                    ? 'scale-105 shadow-md z-10 !ring-2 !ring-slate-900 !ring-offset-1'
                    : 'hover:opacity-90'
                }`}
                title={`${cell.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}: ${
                  cell.isFuture
                    ? 'Upcoming'
                    : cell.isAllGoalsMet
                    ? '🌟 All habit goals met (100%)'
                    : `${cell.completedCount}/${cell.totalHabits} habits completed`
                }`}
              >
                {/* Day number */}
                <span className="text-xs tracking-tight">{cell.dayNumber}</span>

                {/* Status Indicator Icon or Dot */}
                <div className="flex items-center justify-center h-3 w-full">
                  {cell.isAllGoalsMet ? (
                    badgeIcon
                  ) : cell.completedCount > 0 && !cell.isFuture && cell.isCurrentMonth ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                      title={`${cell.completedCount}/${cell.totalHabits} completed`}
                    />
                  ) : cell.isToday ? (
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 gap-y-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold">
              ★
            </span>
            <span className="font-semibold text-emerald-800">All Goals Met</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border border-emerald-400" />
            <span>Partial</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Missed</span>
          </div>
        </div>

        {!isViewingCurrentMonth && (
          <button
            type="button"
            id="cal-jump-today-btn"
            onClick={handleResetToToday}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg transition active:scale-95"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* Interactive Day Details Popover / Drawer */}
      {selectedDay && (
        <div
          id="calendar-selected-day-details"
          data-purpose="selected-day-details"
          className="bg-slate-900 text-white rounded-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>
                  {selectedDay.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {selectedDay.isToday && (
                  <span className="text-[9px] bg-blue-500/30 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {selectedDay.isFuture
                  ? 'Upcoming day — not yet recorded'
                  : selectedDay.isAllGoalsMet
                  ? '🌟 100% Completion: All habit goals conquered!'
                  : `${selectedDay.completedCount} of ${selectedDay.totalHabits} habit goals met (${selectedDay.completionRate}%)`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close day detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!selectedDay.isFuture && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                Habit Breakdown:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedDay.habitStatuses.map(({ habit, completed }) => (
                  <div
                    key={`detail-habit-${habit.id}`}
                    className={`flex items-center justify-between p-1.5 px-2 rounded-xl text-xs ${
                      completed
                        ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="font-medium truncate max-w-[140px]">
                      {habit.name}
                    </span>
                    {completed ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 shrink-0">
                        <Check className="w-3 h-3" /> Met
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        Missed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
