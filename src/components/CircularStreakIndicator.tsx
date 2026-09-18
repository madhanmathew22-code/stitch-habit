import { useState, useRef, useEffect } from 'react';
import { Habit, calculateHabitStreak } from '../types';

interface CircularStreakIndicatorProps {
  habit: Habit;
  size?: number;
}

export default function CircularStreakIndicator({
  habit,
  size = 42,
}: CircularStreakIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Calculate Habit Streak
  const streak = calculateHabitStreak(habit.completionHistory, habit.completed, habit.streak);

  // 2. Calculate Total Tracked Days & Completed Days
  const history = habit.completionHistory || [];
  const totalDays = Math.max(1, history.length + 1);
  const completedDays = history.filter(Boolean).length + (habit.completed ? 1 : 0);

  // 3. Overall Habit Consistency Rate (%)
  const consistencyRate = Math.min(100, Math.round((completedDays / totalDays) * 100));

  // 4. Current Streak Length Relative to Consistency (%)
  // Represents what percentage of the habit's overall consistent completions is sustained in the active streak.
  const relativeRatio = completedDays > 0
    ? Math.min(100, Math.round((streak / completedDays) * 100))
    : (streak > 0 ? 100 : 0);

  // SVG Geometry for Concentric Dual-Rings
  // Outer Ring: Overall Consistency
  const center = size / 2;
  const outerRadius = (size / 2) - 3.5;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerDashoffset = outerCircumference * (1 - consistencyRate / 100);

  // Inner Ring: Streak Relative to Consistency
  const innerRadius = outerRadius - 4.5;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerDashoffset = innerCircumference * (1 - relativeRatio / 100);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  const getStreakColor = () => {
    if (relativeRatio >= 80) return 'stroke-emerald-500';
    if (relativeRatio >= 40) return 'stroke-amber-500';
    if (relativeRatio > 0) return 'stroke-orange-500';
    return 'stroke-slate-300';
  };

  const getConsistencyColor = () => {
    if (consistencyRate >= 80) return 'stroke-teal-400';
    if (consistencyRate >= 50) return 'stroke-emerald-300';
    return 'stroke-sky-300';
  };

  return (
    <div
      ref={containerRef}
      id={`streak-progress-container-${habit.id}`}
      data-purpose="circular-streak-progress-indicator"
      className="relative flex items-center justify-center shrink-0 cursor-pointer select-none group"
      onClick={(e) => {
        e.stopPropagation();
        setShowTooltip((prev) => !prev);
      }}
      title={`Streak vs Consistency: ${relativeRatio}% (${streak}d streak / ${completedDays} completed days, ${consistencyRate}% overall consistency). Click for details.`}
      aria-label={`Current streak is ${relativeRatio}% of overall consistency`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }
      }}
    >
      {/* SVG Concentric Progress Gauge */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 transition-transform duration-300 group-hover:scale-105"
      >
        {/* Outer Ring Background Track */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="2.5"
        />

        {/* Outer Ring: Overall Consistency Arc */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          className={`transition-all duration-700 ease-out ${getConsistencyColor()}`}
          strokeWidth="2.5"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerDashoffset}
          strokeLinecap="round"
        />

        {/* Inner Ring Background Track */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="2.5"
        />

        {/* Inner Ring: Streak Relative to Consistency Arc */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          className={`transition-all duration-700 ease-out ${getStreakColor()}`}
          strokeWidth="2.5"
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Value: Ratio Percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`text-[9px] font-extrabold tracking-tight leading-none ${
            relativeRatio > 0 ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {relativeRatio}%
        </span>
        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-0.5">
          streak
        </span>
      </div>

      {/* Interactive Detail Popover on Click/Tap */}
      {showTooltip && (
        <div
          id={`streak-progress-popover-${habit.id}`}
          className="absolute bottom-full right-0 mb-2 w-52 p-3 bg-slate-900 text-white rounded-2xl shadow-xl z-30 text-left border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Streak vs Consistency
            </span>
            <span className="text-xs font-black text-amber-400">
              {relativeRatio}%
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <span>🔥</span> Current Streak:
              </span>
              <span className="font-bold text-white">
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1">
                <span>📊</span> Consistency Rate:
              </span>
              <span className="font-bold text-teal-400">
                {consistencyRate}% ({completedDays}/{totalDays}d)
              </span>
            </div>

            <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800/80 leading-snug">
              {relativeRatio === 100 ? (
                <span className="text-emerald-300 font-medium">
                  🌟 Peak form! All completed days are held in your current unbroken streak.
                </span>
              ) : relativeRatio > 0 ? (
                <span>
                  Your active streak accounts for <strong>{relativeRatio}%</strong> of your total completed days.
                </span>
              ) : (
                <span className="text-amber-300">
                  Complete today’s habit to restart your streak on top of your {consistencyRate}% consistency!
                </span>
              )}
            </div>
          </div>

          {/* Popover Arrow */}
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
