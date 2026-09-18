import React, { useState, useEffect } from 'react';
import {
  TargetFrequency,
  TargetFrequencyMode,
  FrequencyPeriod,
  formatTargetFrequency,
} from '../types';
import {
  Calendar,
  Repeat,
  CalendarDays,
  Check,
  Plus,
  Minus,
  Sparkles,
  Target,
} from 'lucide-react';

interface TargetFrequencySelectorProps {
  value: TargetFrequency;
  onChange: (freq: TargetFrequency) => void;
  className?: string;
}

const DAYS_OF_WEEK = [
  { dayIndex: 1, short: 'Mon', initial: 'M' },
  { dayIndex: 2, short: 'Tue', initial: 'T' },
  { dayIndex: 3, short: 'Wed', initial: 'W' },
  { dayIndex: 4, short: 'Thu', initial: 'T' },
  { dayIndex: 5, short: 'Fri', initial: 'F' },
  { dayIndex: 6, short: 'Sat', initial: 'S' },
  { dayIndex: 0, short: 'Sun', initial: 'S' },
];

export default function TargetFrequencySelector({
  value,
  onChange,
  className = '',
}: TargetFrequencySelectorProps) {
  const [mode, setMode] = useState<TargetFrequencyMode>(value.mode || 'everyday');
  const [timesPerPeriod, setTimesPerPeriod] = useState<number>(value.timesPerPeriod || 3);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    value.daysOfWeek && value.daysOfWeek.length > 0 ? value.daysOfWeek : [1, 3, 5]
  );

  // Synchronize internal state with incoming props
  useEffect(() => {
    if (value.mode) setMode(value.mode);
    if (value.timesPerPeriod) setTimesPerPeriod(value.timesPerPeriod);
    if (value.daysOfWeek) setSelectedDays(value.daysOfWeek);
  }, [value]);

  // Compute and emit changes upward
  const emitChange = (
    newMode: TargetFrequencyMode,
    newTimes: number,
    newDays: number[]
  ) => {
    let period: FrequencyPeriod = 'week';
    let label = '';

    if (newMode === 'everyday') {
      period = 'day';
      label = 'Every day';
    } else if (newMode === 'times_per_week') {
      period = 'week';
      label = `${newTimes} ${newTimes === 1 ? 'time' : 'times'} a week`;
    } else if (newMode === 'times_per_month') {
      period = 'month';
      label = `${newTimes} ${newTimes === 1 ? 'time' : 'times'} a month`;
    } else if (newMode === 'specific_days') {
      period = 'week';
      if (newDays.length === 0) {
        label = 'No days selected';
      } else if (newDays.length === 7) {
        label = 'Every day';
      } else {
        const sortedDays = [...newDays].sort((a, b) => {
          // Mon (1) to Sun (0)
          const normA = a === 0 ? 7 : a;
          const normB = b === 0 ? 7 : b;
          return normA - normB;
        });
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        label = sortedDays.map((d) => dayNames[d]).join(', ');
      }
    }

    onChange({
      mode: newMode,
      timesPerPeriod: newMode === 'specific_days' ? Math.max(1, newDays.length) : newTimes,
      period,
      daysOfWeek: newDays,
      label,
    });
  };

  const handleModeSwitch = (newMode: TargetFrequencyMode) => {
    setMode(newMode);
    let defaultTimes = timesPerPeriod;
    if (newMode === 'everyday') {
      defaultTimes = 7;
    } else if (newMode === 'times_per_week' && (timesPerPeriod < 1 || timesPerPeriod > 6)) {
      defaultTimes = 3; // Default to 3 times a week
      setTimesPerPeriod(3);
    } else if (newMode === 'times_per_month' && timesPerPeriod < 2) {
      defaultTimes = 4;
      setTimesPerPeriod(4);
    }
    emitChange(newMode, defaultTimes, selectedDays);
  };

  const handleTimesChange = (delta: number) => {
    const min = 1;
    const max = mode === 'times_per_week' ? 6 : 30;
    const nextVal = Math.min(max, Math.max(min, timesPerPeriod + delta));
    setTimesPerPeriod(nextVal);
    emitChange(mode, nextVal, selectedDays);
  };

  const handleSetExactTimes = (count: number) => {
    setTimesPerPeriod(count);
    emitChange(mode, count, selectedDays);
  };

  const handleToggleDay = (dayIndex: number) => {
    let nextDays: number[];
    if (selectedDays.includes(dayIndex)) {
      // Keep at least 1 day selected
      if (selectedDays.length === 1) return;
      nextDays = selectedDays.filter((d) => d !== dayIndex);
    } else {
      nextDays = [...selectedDays, dayIndex];
    }
    setSelectedDays(nextDays);
    emitChange(mode, nextDays.length, nextDays);
  };

  const handleApplyPreset = (presetType: 'mwf' | 'weekdays' | 'weekends' | 'all') => {
    let days: number[] = [];
    if (presetType === 'mwf') days = [1, 3, 5];
    if (presetType === 'weekdays') days = [1, 2, 3, 4, 5];
    if (presetType === 'weekends') days = [6, 0];
    if (presetType === 'all') days = [1, 2, 3, 4, 5, 6, 0];

    setSelectedDays(days);
    emitChange('specific_days', days.length, days);
    setMode('specific_days');
  };

  return (
    <div
      id="target-frequency-selector"
      data-purpose="target-frequency-selector"
      className={`space-y-3 ${className}`}
    >
      {/* Header with Title & Live Target Summary Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Target Frequency
        </label>
        <span
          id="target-frequency-summary-pill"
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-emerald-500" />
          {formatTargetFrequency(value)}
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div
        className="grid grid-cols-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 gap-1 text-[11px] font-semibold"
        role="tablist"
        aria-label="Habit frequency modes"
      >
        <button
          type="button"
          role="tab"
          id="frequency-tab-everyday"
          aria-selected={mode === 'everyday'}
          onClick={() => handleModeSwitch('everyday')}
          className={`py-1.5 px-1 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'everyday'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Every Day
        </button>

        <button
          type="button"
          role="tab"
          id="frequency-tab-times_per_week"
          aria-selected={mode === 'times_per_week'}
          onClick={() => handleModeSwitch('times_per_week')}
          className={`py-1.5 px-1 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'times_per_week'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Per Week
        </button>

        <button
          type="button"
          role="tab"
          id="frequency-tab-specific_days"
          aria-selected={mode === 'specific_days'}
          onClick={() => handleModeSwitch('specific_days')}
          className={`py-1.5 px-1 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'specific_days'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Specific Days
        </button>

        <button
          type="button"
          role="tab"
          id="frequency-tab-times_per_month"
          aria-selected={mode === 'times_per_month'}
          onClick={() => handleModeSwitch('times_per_month')}
          className={`py-1.5 px-1 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'times_per_month'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Per Month
        </button>
      </div>

      {/* Interactive Mode Body */}
      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
        {/* Mode 1: Every Day */}
        {mode === 'everyday' && (
          <div className="text-center py-2 space-y-1.5 animate-in fade-in duration-200">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              7 Days a Week • Consistent Daily Habit
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Best for daily essentials like drinking water, morning meditation, or reading.
            </p>
          </div>
        )}

        {/* Mode 2: Times per Week (e.g., 3 times a week) */}
        {mode === 'times_per_week' && (
          <div className="space-y-3 animate-in fade-in duration-200" data-purpose="times-per-week-controls">
            {/* Stepper Control */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700 shadow-2xs">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Weekly Goal
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {timesPerPeriod} {timesPerPeriod === 1 ? 'time' : 'times'} every week
                </span>
              </div>

              {/* - / + Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="frequency-week-decrement"
                  aria-label="Decrease times per week"
                  disabled={timesPerPeriod <= 1}
                  onClick={() => handleTimesChange(-1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-6 text-center text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {timesPerPeriod}
                </span>

                <button
                  type="button"
                  id="frequency-week-increment"
                  aria-label="Increase times per week"
                  disabled={timesPerPeriod >= 6}
                  onClick={() => handleTimesChange(1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Frequency Buttons (1x to 6x) */}
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Quick Selection:
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isCurrent = timesPerPeriod === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      id={`freq-btn-${num}x-week`}
                      onClick={() => handleSetExactTimes(num)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-xs scale-[1.02]'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {num}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Friendly guidance */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Repeat className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {timesPerPeriod === 3
                  ? 'Recommended pace: 3 times a week (e.g., Mon, Wed, Fri workout)'
                  : `Targeting ${timesPerPeriod} session${timesPerPeriod > 1 ? 's' : ''} spread throughout the week.`}
              </span>
            </div>
          </div>
        )}

        {/* Mode 3: Specific Days of the Week */}
        {mode === 'specific_days' && (
          <div className="space-y-3 animate-in fade-in duration-200" data-purpose="specific-days-controls">
            {/* Days Circles Strip */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Select Days ({selectedDays.length} chosen):
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} / wk
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {DAYS_OF_WEEK.map(({ dayIndex, short, initial }) => {
                  const isChosen = selectedDays.includes(dayIndex);
                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      id={`day-select-${short.toLowerCase()}`}
                      aria-label={`Toggle ${short}`}
                      onClick={() => handleToggleDay(dayIndex)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        isChosen
                          ? 'bg-emerald-500 text-white shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{initial}</span>
                      <span className={`text-[9px] mt-1 ${isChosen ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Days Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('mwf')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
              >
                Mon, Wed, Fri
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('weekdays')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
              >
                Weekdays (M-F)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('weekends')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
              >
                Weekends
              </button>
            </div>
          </div>
        )}

        {/* Mode 4: Times per Month */}
        {mode === 'times_per_month' && (
          <div className="space-y-3 animate-in fade-in duration-200" data-purpose="times-per-month-controls">
            {/* Stepper Control */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-700 shadow-2xs">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Monthly Goal
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {timesPerPeriod} {timesPerPeriod === 1 ? 'time' : 'times'} every month
                </span>
              </div>

              {/* - / + Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="frequency-month-decrement"
                  aria-label="Decrease times per month"
                  disabled={timesPerPeriod <= 1}
                  onClick={() => handleTimesChange(-1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-8 text-center text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {timesPerPeriod}
                </span>

                <button
                  type="button"
                  id="frequency-month-increment"
                  aria-label="Increase times per month"
                  disabled={timesPerPeriod >= 30}
                  onClick={() => handleTimesChange(1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Monthly Presets */}
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Quick Selection:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 4, 8, 12].map((num) => {
                  const isCurrent = timesPerPeriod === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      id={`freq-btn-${num}x-month`}
                      onClick={() => handleSetExactTimes(num)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {num}x/mo
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Great for budget reviews, deep cleaning, or personal reflection days.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
