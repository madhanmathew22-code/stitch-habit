import { Habit as HabitType, calculateHabitStreak } from '../types';
import { getMoodOption } from '../utils/moodHelpers';
import CircularStreakIndicator from './CircularStreakIndicator';
import HabitCompletionToggle from './HabitCompletionToggle';
import HabitIconDisplay from './HabitIconDisplay';

export interface HabitProps {
  habit: HabitType;
  onToggle: (id: string) => void;
  onOpenMoodLog?: (habit: HabitType) => void;
  isScheduledToday?: boolean;
}

export default function Habit({
  habit,
  onToggle,
  onOpenMoodLog,
  isScheduledToday = true,
}: HabitProps) {
  const streak = calculateHabitStreak(habit.completionHistory, habit.completed, habit.streak);
  const moodOption = getMoodOption(habit.todayMood);

  // Take the last 5 days of history (plus today's status) for mini visual completion indicators
  const pastHistory = habit.completionHistory || [];
  const recentPast = pastHistory.slice(-4);
  const recentDays = [...recentPast, habit.completed];

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'Health':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      case 'Work':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
      case 'Personal':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
      case 'Mindfulness':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60';
      case 'Fitness':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
      case 'Learning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-600';
    }
  };

  return (
    <div
      id={`habit-${habit.id}`}
      data-purpose="habit-card"
      className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700/80 transition hover:shadow-md gap-3"
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <HabitIconDisplay iconId={habit.icon} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate">
              {habit.name}
            </h3>

            {/* Current Streak Badge directly next to habit name */}
            <div
              id={`habit-current-streak-${habit.id}`}
              data-purpose="current-streak-badge"
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all shrink-0 whitespace-nowrap ${
                habit.completed
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs'
                  : streak > 0
                    ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/90 dark:border-orange-700/60'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
              }`}
              title={`Current Streak: ${streak} ${streak === 1 ? 'day' : 'days'} consecutive`}
              aria-label={`Current Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
            >
              <span className="text-xs leading-none" aria-hidden="true">🔥</span>
              <span>
                Current Streak: <strong className="font-bold">{streak} {streak === 1 ? 'day' : 'days'}</strong>
              </span>
            </div>

            {/* Category Label */}
            {habit.category && (
              <span
                data-purpose="habit-category-label"
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border tracking-tight shrink-0 transition-colors ${getCategoryBadgeClass(
                  habit.category
                )}`}
              >
                {habit.category}
              </span>
            )}

            {/* Target Frequency Badge */}
            {habit.targetFrequency && (
              <span
                data-purpose="habit-target-frequency-badge"
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shrink-0"
                title={`Target: ${habit.targetFrequency.label}`}
              >
                <span className="text-[9px]">🎯</span>
                <span>{habit.targetFrequency.label}</span>
              </span>
            )}

            {/* Rest Day / Off-Schedule Badge when habit is not scheduled for today */}
            {!isScheduledToday && (
              <span
                id={`habit-rest-day-badge-${habit.id}`}
                data-purpose="habit-rest-day-badge"
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-600/80 shrink-0"
                title="Not scheduled for this day (Rest / Off day)"
              >
                <span className="text-[10px]">💤</span>
                <span>Off-Schedule</span>
              </span>
            )}

            {/* Mood Log Badge */}
            {habit.completed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenMoodLog) onOpenMoodLog(habit);
                }}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${
                  moodOption
                    ? moodOption.badgeBg
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-600 hover:bg-slate-200/70'
                }`}
                title={
                  moodOption
                    ? `Logged Mood: ${moodOption.label}. Click to edit.`
                    : 'Click to log how this habit made you feel'
                }
              >
                <span>{moodOption ? moodOption.emoji : '✨'}</span>
                <span>{moodOption ? moodOption.label : 'Mood'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate">{habit.subtitle}</p>
            {habit.categories && habit.categories.length > 0 ? (
              habit.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600 leading-none"
                >
                  {cat}
                </span>
              ))
            ) : habit.category ? (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600 leading-none">
                {habit.category}
              </span>
            ) : null}
            {recentDays.length > 1 && (
              <>
                <span className="text-slate-200 dark:text-slate-700 text-xs">•</span>
                <div
                  className="flex items-center gap-1"
                  title="Past completion history leading up to today"
                >
                  {recentDays.map((isDone, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        isDone ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Actions: Circular Streak/Consistency Progress Indicator & Toggle Button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Circular Progress Indicator: Streak Length relative to Consistency */}
        <CircularStreakIndicator habit={habit} size={42} />

        {/* Completion Toggle Button with smooth scaling, checkmark draw, and confetti animation */}
        <HabitCompletionToggle
          habitId={habit.id}
          habitName={habit.name}
          completed={Boolean(habit.completed)}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}

export { Habit, Habit as HabitComponent, Habit as HabitItem };
