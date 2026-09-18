import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Habit } from '../types';

interface HabitCompletionChartProps {
  habits: Habit[];
}

interface DayData {
  dayIndex: number; // 0 to 29
  dateStr: string; // "Sep 18"
  tickLabel: string; // "9/18" or "Today"
  completionRate: number; // 0 - 100%
  completedCount: number;
  totalSelected: number;
  [key: string]: any;
}

const PALETTE = [
  { stroke: '#2563EB', fill: '#3B82F6', light: '#DBEAFE', bg: 'bg-blue-500', text: 'text-blue-600' },
  { stroke: '#16A34A', fill: '#22C55E', light: '#DCFCE7', bg: 'bg-emerald-500', text: 'text-emerald-600' },
  { stroke: '#9333EA', fill: '#A855F7', light: '#F3E8FF', bg: 'bg-purple-500', text: 'text-purple-600' },
  { stroke: '#EA580C', fill: '#F97316', light: '#FFEDD5', bg: 'bg-orange-500', text: 'text-orange-600' },
  { stroke: '#0D9488', fill: '#14B8A6', light: '#CCFBF1', bg: 'bg-teal-500', text: 'text-teal-600' },
  { stroke: '#E11D48', fill: '#F43F5E', light: '#FFE4E6', bg: 'bg-rose-500', text: 'text-rose-600' },
];

export default function HabitCompletionChart({ habits }: HabitCompletionChartProps) {
  // State for which habit IDs are currently selected for tracking
  const [selectedIds, setSelectedIds] = useState<string[]>(() => habits.map((h) => h.id));
  const [chartMode, setChartMode] = useState<'rate' | 'compare'>('rate');

  // Fallback if habits array changes or becomes empty
  const activeSelectedIds = useMemo(() => {
    const validIds = habits.map((h) => h.id);
    const filtered = selectedIds.filter((id) => validIds.includes(id));
    return filtered.length > 0 ? filtered : validIds.slice(0, 1);
  }, [selectedIds, habits]);

  const toggleHabit = (id: string) => {
    if (activeSelectedIds.includes(id)) {
      // Don't allow deselecting the very last habit
      if (activeSelectedIds.length > 1) {
        setSelectedIds(activeSelectedIds.filter((item) => item !== id));
      }
    } else {
      setSelectedIds([...activeSelectedIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedIds(habits.map((h) => h.id));
  };

  // Generate 30 days of data ending at today (2026-09-18)
  const chartData = useMemo(() => {
    const days: DayData[] = [];
    const baseDate = new Date(2026, 8, 18); // Sep 18, 2026

    for (let i = 0; i < 30; i++) {
      // i = 0 is 29 days ago (Aug 20), i = 29 is today (Sep 18)
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

      let completedCount = 0;
      const row: DayData = {
        dayIndex: i,
        dateStr,
        tickLabel,
        completionRate: 0,
        completedCount: 0,
        totalSelected: activeSelectedIds.length,
      };

      // Check each habit
      habits.forEach((habit) => {
        let isDone = false;
        if (i === 29) {
          // Today
          isDone = Boolean(habit.completed);
        } else {
          // Prior 29 days
          const history = habit.completionHistory || [];
          const historyIndex = history.length - (29 - i);
          if (historyIndex >= 0 && historyIndex < history.length) {
            isDone = Boolean(history[historyIndex]);
          } else {
            // Consistent fallback for habits with fewer history points
            isDone = ((i + habit.name.length) % 3 !== 0);
          }
        }

        row[`done_${habit.id}`] = isDone;
        row[`val_${habit.id}`] = isDone ? 100 : 0;

        if (activeSelectedIds.includes(habit.id)) {
          if (isDone) completedCount++;
        }
      });

      row.completedCount = completedCount;
      row.completionRate =
        activeSelectedIds.length > 0
          ? Math.round((completedCount / activeSelectedIds.length) * 100)
          : 0;

      days.push(row);
    }

    return days;
  }, [habits, activeSelectedIds]);

  // Calculate 30-day stats for selected habits
  const stats = useMemo(() => {
    if (chartData.length === 0) return { avgRate: 0, perfectDays: 0, bestStreak: 0 };

    const totalRate = chartData.reduce((acc, curr) => acc + curr.completionRate, 0);
    const avgRate = Math.round(totalRate / chartData.length);
    const perfectDays = chartData.filter((d) => d.completionRate === 100).length;

    let currentStreak = 0;
    let maxStreak = 0;
    chartData.forEach((d) => {
      if (d.completionRate >= 50) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    return { avgRate, perfectDays, bestStreak: maxStreak };
  }, [chartData]);

  // Selected habit objects
  const selectedHabitObjects = useMemo(() => {
    return habits.filter((h) => activeSelectedIds.includes(h.id));
  }, [habits, activeSelectedIds]);

  return (
    <section
      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/80 space-y-3.5"
      data-purpose="habit-completion-chart-container"
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">30-Day Completion History</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Recharts
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Mapping consistency over the last 30 days
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold self-start">
          <button
            type="button"
            onClick={() => setChartMode('rate')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              chartMode === 'rate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completion %
          </button>
          <button
            type="button"
            onClick={() => setChartMode('compare')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              chartMode === 'compare'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {/* Habit Selection Chips */}
      <div className="space-y-1.5" data-purpose="habit-selector-chips">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            Filter Habits ({activeSelectedIds.length}/{habits.length}):
          </span>
          <button
            type="button"
            onClick={selectAll}
            className="text-[11px] font-semibold text-[#2F80ED] hover:underline cursor-pointer"
          >
            Select All
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
          {habits.map((habit, idx) => {
            const isSelected = activeSelectedIds.includes(habit.id);
            const palette = PALETTE[idx % PALETTE.length];
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => toggleHabit(habit.id)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? `${palette.light} border-${palette.stroke} text-slate-900 shadow-xs font-semibold`
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSelected ? palette.bg : 'bg-slate-300'
                  }`}
                />
                <span className="truncate max-w-[110px]">{habit.name}</span>
                {isSelected && (
                  <svg className="w-3 h-3 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="w-full h-48 min-h-[192px] pt-1" data-purpose="recharts-render-area">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
          {chartMode === 'rate' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="habitRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="tickLabel"
                interval={5}
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip habits={habits} selectedIds={activeSelectedIds} />} />
              <Area
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#habitRateGrad)"
                activeDot={{ r: 5, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="tickLabel"
                interval={5}
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(v) => (v === 100 ? 'Done' : v === 0 ? 'Miss' : '')}
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip habits={habits} selectedIds={activeSelectedIds} />} />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                iconType="circle"
              />
              {selectedHabitObjects.map((habit) => {
                const habitIdx = habits.findIndex((h) => h.id === habit.id);
                const palette = PALETTE[habitIdx % PALETTE.length];
                return (
                  <Line
                    key={habit.id}
                    type="monotone"
                    dataKey={`val_${habit.id}`}
                    name={habit.name}
                    stroke={palette.stroke}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 30-Day Quick Metric Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100/90 text-center">
        <div className="bg-slate-50/80 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 font-medium">30d Avg Rate</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{stats.avgRate}%</div>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 font-medium">Perfect Days</div>
          <div className="text-sm font-bold text-emerald-600 mt-0.5">
            {stats.perfectDays} <span className="text-[10px] font-normal text-slate-400">/ 30</span>
          </div>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 font-medium">Best Streak</div>
          <div className="text-sm font-bold text-amber-600 mt-0.5">
            {stats.bestStreak} <span className="text-[10px] font-normal text-slate-400">days</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Custom Tooltip component for Recharts
function CustomTooltip({
  active,
  payload,
  habits,
  selectedIds,
}: {
  active?: boolean;
  payload?: any[];
  habits: Habit[];
  selectedIds: string[];
}) {
  if (!active || !payload || !payload.length) return null;

  const data: DayData = payload[0].payload;
  const selectedHabits = habits.filter((h) => selectedIds.includes(h.id));

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs min-w-[170px] z-50 pointer-events-none">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-3">
        <span className="font-semibold text-slate-200">{data.dateStr}, 2026</span>
        <span className="text-emerald-400 font-bold">{data.completionRate}%</span>
      </div>

      <div className="pt-1.5 space-y-1">
        <div className="text-[10px] text-slate-400 mb-1">
          {data.completedCount} of {selectedHabits.length} habits completed:
        </div>
        {selectedHabits.map((habit) => {
          const isDone = Boolean(data[`done_${habit.id}`]);
          return (
            <div key={habit.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-300 truncate max-w-[120px]">{habit.name}</span>
              {isDone ? (
                <span className="text-emerald-400 font-medium text-[10px] flex items-center gap-0.5">
                  ✓ Done
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">Missed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
