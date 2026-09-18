import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Flame, Sparkles, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { Habit, MoodId, MOOD_OPTIONS } from '../types';
import { getMoodOption } from '../utils/moodHelpers';

interface StreakMoodCorrelationChartProps {
  habits: Habit[];
  className?: string;
}

const MOOD_SCORES: Record<MoodId, number> = {
  energized: 5,
  accomplished: 4,
  calm: 3,
  neutral: 2,
  tired: 1,
};

const SCORE_MOOD_MAP: Record<number, { id: MoodId; emoji: string; label: string }> = {
  5: { id: 'energized', emoji: '⚡️', label: 'Energized' },
  4: { id: 'accomplished', emoji: '🤩', label: 'Accomplished' },
  3: { id: 'calm', emoji: '🧘', label: 'Calm' },
  2: { id: 'neutral', emoji: '🙂', label: 'Neutral' },
  1: { id: 'tired', emoji: '🥱', label: 'Tired' },
};

interface DayCorrelationData {
  dayIndex: number; // 0 (29 days ago) to 29 (today)
  dateStr: string; // "Sep 18"
  tickLabel: string; // "9/18" or "Today"
  streak: number; // Streak for selected habit or average streak
  moodScore: number | null; // 1 to 5, or null if no mood logged
  moodLabel?: string;
  moodEmoji?: string;
  moodNote?: string;
  habitDone: boolean;
  activeHabitCount: number;
}

export default function StreakMoodCorrelationChart({
  habits,
  className = '',
}: StreakMoodCorrelationChartProps) {
  // 'all' represents average across all habits, or a specific habit id
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [showInsightGuide, setShowInsightGuide] = useState<boolean>(false);

  // Generate 30 days of data ending at 2026-09-18
  const chartData = useMemo(() => {
    const days: DayCorrelationData[] = [];
    const baseDate = new Date(2026, 8, 18); // Sep 18, 2026

    // Pre-calculate running streaks for each habit over the 30-day window
    // Day 0 is 29 days ago, Day 29 is today.
    const habitRunningStreaks: Record<string, number[]> = {};
    const habitMoodHistory: Record<string, (MoodId | null)[]> = {};
    const habitCompletionMap: Record<string, boolean[]> = {};

    habits.forEach((h) => {
      const completions: boolean[] = [];
      const moods: (MoodId | null)[] = [];

      for (let i = 0; i < 30; i++) {
        if (i === 29) {
          completions.push(Boolean(h.completed));
          moods.push(h.completed ? (h.todayMood || null) : null);
        } else {
          const hist = h.completionHistory || [];
          const idx = hist.length - (29 - i);
          const isDone = idx >= 0 && idx < hist.length ? Boolean(hist[idx]) : ((i + h.name.length) % 3 !== 0);
          completions.push(isDone);

          const mHist = h.moodHistory || [];
          const mIdx = mHist.length - (29 - i);
          const mVal = mIdx >= 0 && mIdx < mHist.length ? mHist[mIdx] : null;
          moods.push(isDone ? mVal : null);
        }
      }

      habitCompletionMap[h.id] = completions;
      habitMoodHistory[h.id] = moods;

      // Compute running streak sequentially
      const running: number[] = [];
      let currentStreak = 0;
      for (let i = 0; i < 30; i++) {
        if (completions[i]) {
          currentStreak += 1;
        } else {
          currentStreak = 0;
        }
        running.push(currentStreak);
      }
      habitRunningStreaks[h.id] = running;
    });

    for (let i = 0; i < 30; i++) {
      const dayOffset = 29 - i;
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() - dayOffset);

      const dateStr = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const tickLabel =
        i === 29
          ? 'Today'
          : targetDate.toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
            });

      if (selectedHabitId === 'all') {
        // Compute average streak across all habits on day i
        let totalStreak = 0;
        let totalMoodScore = 0;
        let moodCount = 0;
        let completedHabits = 0;

        habits.forEach((h) => {
          const streakVal = habitRunningStreaks[h.id]?.[i] || 0;
          totalStreak += streakVal;

          const isCompleted = habitCompletionMap[h.id]?.[i];
          if (isCompleted) completedHabits++;

          const moodVal = habitMoodHistory[h.id]?.[i];
          if (moodVal && MOOD_SCORES[moodVal]) {
            totalMoodScore += MOOD_SCORES[moodVal];
            moodCount++;
          }
        });

        const avgStreak = habits.length > 0 ? parseFloat((totalStreak / habits.length).toFixed(1)) : 0;
        const avgMood = moodCount > 0 ? parseFloat((totalMoodScore / moodCount).toFixed(1)) : null;

        // Closest mood representation
        let moodLabel: string | undefined;
        let moodEmoji: string | undefined;
        if (avgMood !== null) {
          const roundedScore = Math.min(5, Math.max(1, Math.round(avgMood)));
          const mapped = SCORE_MOOD_MAP[roundedScore];
          moodLabel = mapped?.label;
          moodEmoji = mapped?.emoji;
        }

        days.push({
          dayIndex: i,
          dateStr,
          tickLabel,
          streak: avgStreak,
          moodScore: avgMood,
          moodLabel,
          moodEmoji,
          habitDone: completedHabits > 0,
          activeHabitCount: completedHabits,
        });
      } else {
        // Specific habit selected
        const habit = habits.find((h) => h.id === selectedHabitId);
        const streakVal = habitRunningStreaks[selectedHabitId]?.[i] || 0;
        const isDone = habitCompletionMap[selectedHabitId]?.[i] || false;
        const moodVal = habitMoodHistory[selectedHabitId]?.[i] || null;
        const moodScore = moodVal && MOOD_SCORES[moodVal] ? MOOD_SCORES[moodVal] : null;

        let moodNote: string | undefined;
        if (i === 29 && habit?.todayMoodNote) {
          moodNote = habit.todayMoodNote;
        }

        const moodOpt = getMoodOption(moodVal);

        days.push({
          dayIndex: i,
          dateStr,
          tickLabel,
          streak: streakVal,
          moodScore,
          moodLabel: moodOpt?.label,
          moodEmoji: moodOpt?.emoji,
          moodNote,
          habitDone: isDone,
          activeHabitCount: isDone ? 1 : 0,
        });
      }
    }

    return days;
  }, [habits, selectedHabitId]);

  // Statistical Correlation Analysis (Pearson r)
  const correlationAnalysis = useMemo(() => {
    // Collect pairs where moodScore is not null
    const validPairs = chartData.filter((d) => d.moodScore !== null) as {
      streak: number;
      moodScore: number;
    }[];

    if (validPairs.length < 3) {
      return {
        r: 0,
        label: 'Insufficient Data',
        description: 'Log habit moods across more days to calculate statistical correlation.',
        avgMoodHighStreak: 0,
        avgMoodLowStreak: 0,
        streakPeak: 0,
        positiveStreakRatio: 0,
      };
    }

    const n = validPairs.length;
    const meanStreak = validPairs.reduce((acc, p) => acc + p.streak, 0) / n;
    const meanMood = validPairs.reduce((acc, p) => acc + p.moodScore, 0) / n;

    let numerator = 0;
    let denomStreak = 0;
    let denomMood = 0;

    validPairs.forEach((p) => {
      const diffStreak = p.streak - meanStreak;
      const diffMood = p.moodScore - meanMood;
      numerator += diffStreak * diffMood;
      denomStreak += diffStreak * diffStreak;
      denomMood += diffMood * diffMood;
    });

    const denom = Math.sqrt(denomStreak * denomMood);
    let r = denom > 0 ? numerator / denom : 0;
    // Bound to [-1, 1]
    r = Math.max(-1, Math.min(1, r));

    // Compare mood on streak days (streak >= 3) vs low streak days (streak < 3)
    const highStreakMoods = validPairs.filter((p) => p.streak >= 3).map((p) => p.moodScore);
    const lowStreakMoods = validPairs.filter((p) => p.streak < 3).map((p) => p.moodScore);

    const avgMoodHighStreak =
      highStreakMoods.length > 0
        ? parseFloat((highStreakMoods.reduce((a, b) => a + b, 0) / highStreakMoods.length).toFixed(1))
        : 0;

    const avgMoodLowStreak =
      lowStreakMoods.length > 0
        ? parseFloat((lowStreakMoods.reduce((a, b) => a + b, 0) / lowStreakMoods.length).toFixed(1))
        : 0;

    const streakPeak = Math.max(...chartData.map((d) => d.streak));

    let label = 'Neutral Correlation';
    let description = 'Habit streaks and moods appear relatively independent.';

    if (r >= 0.65) {
      label = 'Strong Positive Correlation';
      description = 'Unbroken streaks strongly correspond with higher energy, calmness, and satisfaction.';
    } else if (r >= 0.35) {
      label = 'Moderate Positive Correlation';
      description = 'Consistent habit completion reliably lifts overall recorded mood levels.';
    } else if (r > 0.1) {
      label = 'Mild Positive Correlation';
      description = 'Slight positive relationship between longer streaks and pleasant moods.';
    } else if (r <= -0.2) {
      label = 'Inverted Trend';
      description = 'High streaks might be accompanied by fatigue; consider adding recovery periods.';
    }

    return {
      r: parseFloat(r.toFixed(2)),
      label,
      description,
      avgMoodHighStreak,
      avgMoodLowStreak,
      streakPeak,
    };
  }, [chartData]);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <section
      id="streak-mood-correlation-card"
      data-purpose="streak-mood-correlation-section"
      className={`bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/80 dark:border-slate-700 space-y-4 ${className}`}
    >
      {/* Header & Habit Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-500/20 to-teal-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold border border-orange-200/50 dark:border-orange-800/50 shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Streak & Mood Correlation
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600">
                Last 30 Days
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Visualizing how consecutive habit execution influences emotional wellbeing
            </p>
          </div>
        </div>

        {/* Dropdown to filter by Habit or All */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="streak-mood-habit-select" className="sr-only">
            Select habit for streak mood analysis
          </label>
          <select
            id="streak-mood-habit-select"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
          >
            <option value="all">⚡️ All Habits (Average)</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            id="streak-mood-info-btn"
            onClick={() => setShowInsightGuide((v) => !v)}
            aria-label="Toggle correlation analysis guide"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistical Insight Summary Banner */}
      <div
        id="streak-mood-correlation-badge-banner"
        className="rounded-2xl p-3.5 bg-linear-to-r from-orange-50/70 via-amber-50/50 to-teal-50/70 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-teal-950/30 border border-orange-100/80 dark:border-orange-900/50"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="text-orange-600 dark:text-orange-400">r = {correlationAnalysis.r > 0 ? `+${correlationAnalysis.r}` : correlationAnalysis.r}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-orange-200/60 dark:border-orange-800/60 shadow-2xs">
                  {correlationAnalysis.label}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              {correlationAnalysis.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-orange-100 dark:border-orange-900/40">
            {correlationAnalysis.avgMoodHighStreak > 0 && (
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                  Mood on Streaks ≥ 3d
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center sm:justify-end gap-1">
                  <span>{correlationAnalysis.avgMoodHighStreak}</span>
                  <span className="text-[10px] text-slate-400 font-normal">/ 5.0</span>
                </span>
              </div>
            )}
            <div className="text-left sm:text-right pl-3 border-l border-orange-200/60 dark:border-orange-800/60">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                Peak Streak
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center sm:justify-end gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{correlationAnalysis.streakPeak} days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Info explanation */}
        {showInsightGuide && (
          <div className="mt-3 pt-3 border-t border-orange-200/60 dark:border-orange-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 animate-fadeIn">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <p>
                <strong>How to read this chart:</strong> The orange line plots consecutive completion streak length (left axis), while the teal line tracks recorded mood scores from 1 (Tired) to 5 (Energized) on the right axis. Tracking both over 30 days reveals how sustained momentum impacts your emotional vitality.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recharts Dual-Axis Line Chart */}
      <div className="w-full h-64 sm:h-72" id="streak-mood-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -16, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#94a3b8"
              opacity={0.2}
              vertical={false}
            />

            {/* X-Axis: 30 days */}
            <XAxis
              dataKey="tickLabel"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tickLine={false}
              interval={4}
            />

            {/* Left Y-Axis: Streak (Days) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#ea580c' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}d`}
            />

            {/* Right Y-Axis: Mood Score (1-5) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: '#0d9488' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const map: Record<number, string> = {
                  5: '5⚡️',
                  4: '4🤩',
                  3: '3🧘',
                  2: '2🙂',
                  1: '1🥱',
                };
                return map[v] || `${v}`;
              }}
            />

            {/* Interactive Tooltip */}
            <Tooltip
              content={<CustomCorrelationTooltip selectedHabitName={selectedHabit?.name} />}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
              formatter={(value) => {
                if (value === 'streak') {
                  return <span className="font-semibold text-orange-600 dark:text-orange-400">Streak (Days)</span>;
                }
                if (value === 'moodScore') {
                  return <span className="font-semibold text-teal-600 dark:text-teal-400">Logged Mood (1–5)</span>;
                }
                return value;
              }}
            />

            {/* Line 1: Streak */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="streak"
              name="streak"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#F97316', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#EA580C', stroke: '#FED7AA', strokeWidth: 2 }}
              isAnimationActive={true}
            />

            {/* Line 2: Mood Score */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="moodScore"
              name="moodScore"
              stroke="#0D9488"
              strokeWidth={2.5}
              connectNulls={true}
              dot={{ r: 3, fill: '#0D9488', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#0F766E', stroke: '#CCFBF1', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Mood Score Scale Reference */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Habit Streak</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Mood Score</span>
          </span>
        </div>

        {/* Mood Scale Key */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Scale:</span>
          <span>1 🥱</span>
          <span>2 🙂</span>
          <span>3 🧘</span>
          <span>4 🤩</span>
          <span>5 ⚡️</span>
        </div>
      </div>
    </section>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  selectedHabitName?: string;
}

function CustomCorrelationTooltip({ active, payload, label, selectedHabitName }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data: DayCorrelationData = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs backdrop-blur-xs min-w-[190px] space-y-2">
      {/* Date & Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-bold text-slate-200">{data.dateStr}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {selectedHabitName || 'All Habits Avg'}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="space-y-1.5">
        {/* Streak */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-orange-400 font-medium">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Streak
          </span>
          <span className="font-bold text-orange-300">
            {data.streak} {data.streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Mood */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-teal-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Mood
          </span>
          {data.moodScore !== null ? (
            <span className="font-bold text-teal-300 flex items-center gap-1">
              <span>{data.moodEmoji}</span>
              <span>{data.moodLabel}</span>
              <span className="text-[10px] text-teal-400 font-normal">({data.moodScore}/5)</span>
            </span>
          ) : (
            <span className="text-slate-500 italic text-[11px]">No mood logged</span>
          )}
        </div>
      </div>

      {/* Optional Note / Status */}
      {data.moodNote && (
        <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 italic">
          “{data.moodNote}”
        </div>
      )}

      {/* Habit status */}
      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
        <span>Completion:</span>
        <span className={data.habitDone ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
          {data.habitDone ? 'Completed' : 'Rest / Missed'}
        </span>
      </div>
    </div>
  );
}
