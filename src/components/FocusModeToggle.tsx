import React from 'react';
import { Target, Eye, EyeOff, Sparkles, Calendar } from 'lucide-react';

interface FocusModeToggleProps {
  isFocusMode: boolean;
  onToggle: () => void;
  scheduledCount: number;
  inactiveCount: number;
  dayLabel: string;
  className?: string;
}

export default function FocusModeToggle({
  isFocusMode,
  onToggle,
  scheduledCount,
  inactiveCount,
  dayLabel,
  className = '',
}: FocusModeToggleProps) {
  return (
    <section
      id="focus-mode-section"
      data-purpose="focus-mode-toggle-card"
      className={`rounded-2xl p-3 sm:p-3.5 transition-all duration-300 border ${
        isFocusMode
          ? 'bg-linear-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/90 dark:from-indigo-950/40 dark:via-slate-800/90 dark:to-emerald-950/40 border-indigo-200/90 dark:border-indigo-800/80 shadow-xs'
          : 'bg-white/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/80 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon & Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isFocusMode
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-300/50 dark:shadow-indigo-950 ring-2 ring-indigo-400/30'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Target className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Focus Mode
              </h3>

              {isFocusMode ? (
                <span
                  id="focus-mode-badge-active"
                  className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-700/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  Active
                </span>
              ) : (
                <span
                  id="focus-mode-badge-off"
                  className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-600"
                >
                  Off
                </span>
              )}

              {isFocusMode && inactiveCount > 0 && (
                <span
                  id="focus-mode-hidden-count"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                  title={`${inactiveCount} off-schedule habits hidden`}
                >
                  {inactiveCount} hidden
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug truncate">
              {isFocusMode
                ? `Concentrating on ${scheduledCount} ${scheduledCount === 1 ? 'habit' : 'habits'} scheduled for ${dayLabel}`
                : `Showing all habits (${inactiveCount} off-schedule for ${dayLabel})`}
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="focus-mode-toggle-btn"
            role="switch"
            aria-checked={isFocusMode}
            aria-label="Toggle Focus Mode to show only habits scheduled for that day"
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              isFocusMode
                ? 'bg-indigo-600 dark:bg-indigo-500'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <span className="sr-only">Toggle Focus Mode</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isFocusMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
