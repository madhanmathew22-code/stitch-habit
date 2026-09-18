import { useMemo } from 'react';
import { Habit } from '../types';
import { computeMoodAnalytics } from '../utils/moodHelpers';

interface MoodAnalyticsSectionProps {
  habits: Habit[];
  timeframe: 'weekly' | 'monthly' | 'yearly';
}

export default function MoodAnalyticsSection({ habits, timeframe }: MoodAnalyticsSectionProps) {
  const analytics = useMemo(() => {
    return computeMoodAnalytics(habits, timeframe);
  }, [habits, timeframe]);

  const timeframeLabel =
    timeframe === 'weekly' ? 'Past 7 Days' : timeframe === 'monthly' ? 'Past 30 Days' : 'Past Year';

  return (
    <section className="space-y-3.5" data-purpose="mood-analytics-section">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm shadow-2xs border border-teal-100">
            ✨
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Emotional Context & Moods
            </h2>
            <p className="text-[11px] text-slate-400">
              Emotional reflections recorded upon habit completions ({timeframeLabel})
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {analytics.totalLogs} logged
        </span>
      </div>

      {/* Dominant Mood Highlight Banner */}
      {analytics.dominantMood ? (
        <div className="p-3.5 rounded-2xl bg-linear-to-r from-teal-50/90 via-emerald-50/70 to-slate-50 border border-teal-100/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1.5 bg-white rounded-2xl shadow-2xs border border-teal-100/60">
                {analytics.dominantMood.emoji}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Dominant Mindset ({analytics.dominantPercentage}%)
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {analytics.dominantMood.label}
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Your completed habits predominantly evoke <strong className="font-semibold">{analytics.dominantMood.label.toLowerCase()}</strong> states.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Mark your habits complete on the Home dashboard to log your first mood!
          </p>
        </div>
      )}

      {/* Visual Proportional Multi-Mood Bar */}
      {analytics.totalLogs > 0 && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Mood Proportions</span>
            <span className="text-[11px] text-slate-400 font-normal">All Habit Completions</span>
          </div>

          {/* Color Stack Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {analytics.moodStats.map((stat) => {
              if (stat.count === 0) return null;
              const bgColors: Record<string, string> = {
                energized: 'bg-amber-400',
                accomplished: 'bg-emerald-500',
                calm: 'bg-teal-500',
                neutral: 'bg-sky-400',
                tired: 'bg-purple-400',
              };
              return (
                <div
                  key={stat.mood.id}
                  className={`h-full rounded-full transition-all duration-500 ${bgColors[stat.mood.id] || 'bg-slate-400'}`}
                  style={{ width: `${stat.percentage}%` }}
                  title={`${stat.mood.label}: ${stat.count} (${stat.percentage}%)`}
                />
              );
            })}
          </div>

          {/* 5 Emojis Micro Distribution List */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {analytics.moodStats.map((stat) => (
              <div
                key={stat.mood.id}
                className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 transition text-center"
              >
                <span className="text-base">{stat.mood.emoji}</span>
                <span className="text-[10px] font-bold text-slate-800 mt-0.5">
                  {stat.percentage}%
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {stat.mood.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit-Mood Affinity Correlation */}
      {analytics.habitAffinities.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">
              Habit-to-Emotion Correlation
            </h3>
            <span className="text-[10px] text-slate-400">Primary associated mood</span>
          </div>

          <div className="space-y-2">
            {analytics.habitAffinities.slice(0, 4).map((aff) => (
              <div
                key={aff.habitId}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100/90"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{aff.dominantMood.emoji}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                      {aff.habitName}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {aff.dominantMood.label} ({aff.affinityPercentage}%)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aff.dominantMood.badgeBg}`}>
                    {aff.dominantMood.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Emotional Context Journal / Timeline */}
      {analytics.recentEntries.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">
              Recent Mood Log Entries
            </h3>
            <span className="text-[10px] text-slate-400">Completed Habits</span>
          </div>

          <div className="space-y-1.5">
            {analytics.recentEntries.slice(0, 4).map((entry, idx) => {
              const moodOpt = analytics.moodStats.find((m) => m.mood.id === entry.mood)?.mood;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 transition border border-slate-100/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg shrink-0">{moodOpt?.emoji || '✨'}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {entry.habitName}
                      </p>
                      {entry.note ? (
                        <p className="text-[10px] text-slate-500 italic line-clamp-1">
                          “{entry.note}”
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">{moodOpt?.label} state</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    {entry.loggedAt || entry.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
