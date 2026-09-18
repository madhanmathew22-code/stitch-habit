import { Habit, HabitCategory, HabitIconKey, MilestoneTier } from '../types';

export type JourneyEventType = 'milestone' | 'streak' | 'perfect_day';

export interface HabitJourneyEvent {
  id: string;
  type: JourneyEventType;
  date: Date;
  dateStr: string; // e.g. "Sep 18, 2026"
  relativeDaysAgo: number; // 0 = today, 1 = yesterday, etc.
  formattedRelative: string; // "Today", "Yesterday", "3 days ago", etc.
  title: string;
  subtitle: string;
  description: string;
  habitName?: string;
  habitIcon?: HabitIconKey;
  streakCount?: number;
  milestoneTier?: MilestoneTier;
  iconType: 'Flame' | 'Zap' | 'Award' | 'Trophy' | 'Crown' | 'ShieldCheck' | 'Sparkles' | 'Star' | 'Check';
  xpEarned: number;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  metricLabel?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getRelativeLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  const weeks = Math.floor(daysAgo / 7);
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
}

/**
 * Builds the chronological Habit Journey timeline for the last 30 days.
 * Synthesizes completed milestones, significant habit streaks (3+, 7+, 14+, 21+, 30+),
 * and 100% completion "Perfect Days".
 */
export function buildHabitJourneyTimeline(
  habits: Habit[],
  referenceDate: Date = new Date(2026, 8, 18) // Sep 18, 2026
): HabitJourneyEvent[] {
  const events: HabitJourneyEvent[] = [];

  if (!habits || habits.length === 0) {
    return [];
  }

  // Pre-calculate daily completion status for each habit for the past 30 days (0 = today, 29 = 29 days ago)
  const daysTracked = 30;
  const dailyMatrix: { [dayAgo: number]: { [habitId: string]: boolean } } = {};

  for (let dayAgo = 0; dayAgo < daysTracked; dayAgo++) {
    dailyMatrix[dayAgo] = {};
    for (const habit of habits) {
      if (dayAgo === 0) {
        dailyMatrix[dayAgo][habit.id] = Boolean(habit.completed);
      } else {
        const history = habit.completionHistory || [];
        const histIndex = history.length - dayAgo;
        if (histIndex >= 0 && histIndex < history.length) {
          dailyMatrix[dayAgo][habit.id] = Boolean(history[histIndex]);
        } else {
          // If no history exists at this offset, treat as incomplete
          dailyMatrix[dayAgo][habit.id] = false;
        }
      }
    }
  }

  // 1. Detect cumulative streaks achieved on each day across the past 30 days
  for (const habit of habits) {
    // For each day, measure the streak length up to that day
    let currentRun = 0;
    const streakOnDay: { [dayAgo: number]: number } = {};

    // Calculate from the earliest day (29 days ago) to today (0 days ago)
    for (let dayAgo = daysTracked - 1; dayAgo >= 0; dayAgo--) {
      const isDone = dailyMatrix[dayAgo][habit.id];
      if (isDone) {
        currentRun++;
      } else {
        currentRun = 0;
      }
      streakOnDay[dayAgo] = currentRun;
    }

    // Check key milestone streak achievements
    const milestoneThresholds = [
      {
        threshold: 30,
        tier: 'diamond' as MilestoneTier,
        title: 'Monthly Master (30-Day Streak)',
        desc: `Maintained 30 uninterrupted days of ${habit.name}. Peak consistency unlocked!`,
        iconType: 'Crown' as const,
        xp: 300,
        badgeLabel: 'Diamond Milestone',
        badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
        accentBorder: 'border-cyan-400 dark:border-cyan-600',
      },
      {
        threshold: 21,
        tier: 'platinum' as MilestoneTier,
        title: 'Habit Builder (21-Day Habit Milestone)',
        desc: `Reached the scientific 21-day neuroplasticity threshold for ${habit.name}.`,
        iconType: 'Trophy' as const,
        xp: 200,
        badgeLabel: 'Platinum Milestone',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
        accentBorder: 'border-indigo-400 dark:border-indigo-600',
      },
      {
        threshold: 14,
        tier: 'gold' as MilestoneTier,
        title: 'Fortnight Focus (14-Day Streak)',
        desc: `Sustained 2 full consecutive weeks of unwavering discipline for ${habit.name}.`,
        iconType: 'Award' as const,
        xp: 150,
        badgeLabel: 'Gold Milestone',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        accentBorder: 'border-amber-400 dark:border-amber-600',
      },
      {
        threshold: 7,
        tier: 'silver' as MilestoneTier,
        title: 'Consistency Champion (7-Day Streak)',
        desc: `Conquered a full 7-day week of continuous consistency with ${habit.name}.`,
        iconType: 'Zap' as const,
        xp: 100,
        badgeLabel: 'Silver Milestone',
        badgeBg: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
        accentBorder: 'border-slate-400 dark:border-slate-500',
      },
      {
        threshold: 3,
        tier: 'bronze' as MilestoneTier,
        title: 'Spark Starter (3-Day Streak)',
        desc: `Ignited initial momentum with 3 consecutive completions of ${habit.name}.`,
        iconType: 'Flame' as const,
        xp: 50,
        badgeLabel: 'Bronze Milestone',
        badgeBg: 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
        accentBorder: 'border-orange-400 dark:border-orange-600',
      },
    ];

    for (const m of milestoneThresholds) {
      for (let dayAgo = 0; dayAgo < daysTracked; dayAgo++) {
        // If exact threshold was reached on this day
        if (streakOnDay[dayAgo] === m.threshold) {
          const eventDate = new Date(referenceDate);
          eventDate.setDate(referenceDate.getDate() - dayAgo);

          events.push({
            id: `milestone-${habit.id}-${m.threshold}-${dayAgo}`,
            type: 'milestone',
            date: eventDate,
            dateStr: formatDate(eventDate),
            relativeDaysAgo: dayAgo,
            formattedRelative: getRelativeLabel(dayAgo),
            title: m.title,
            subtitle: `${habit.name} • ${m.threshold}-Day Milestone`,
            description: m.desc,
            habitName: habit.name,
            habitIcon: habit.icon,
            streakCount: m.threshold,
            milestoneTier: m.tier,
            iconType: m.iconType,
            xpEarned: m.xp,
            badgeLabel: m.badgeLabel,
            badgeBg: m.badgeBg,
            badgeText: 'text-slate-800 dark:text-slate-100',
            accentBorder: m.accentBorder,
            metricLabel: `${m.threshold} Days`,
          });
          break; // only create once per threshold
        }
      }
    }

    // 2. Significant streaks (e.g. current active streak of 5+ days if not already a milestone on that day)
    const currentActiveStreak = streakOnDay[0];
    if (
      currentActiveStreak >= 5 &&
      ![3, 7, 14, 21, 30].includes(currentActiveStreak)
    ) {
      events.push({
        id: `streak-active-${habit.id}-${currentActiveStreak}`,
        type: 'streak',
        date: referenceDate,
        dateStr: formatDate(referenceDate),
        relativeDaysAgo: 0,
        formattedRelative: 'Today',
        title: `${currentActiveStreak}-Day Active Streak`,
        subtitle: `${habit.name} is on fire!`,
        description: `You have successfully maintained ${habit.name} for ${currentActiveStreak} days without missing a single beat.`,
        habitName: habit.name,
        habitIcon: habit.icon,
        streakCount: currentActiveStreak,
        iconType: 'Flame',
        xpEarned: currentActiveStreak * 10,
        badgeLabel: `${currentActiveStreak}-Day Streak`,
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        badgeText: 'text-amber-800 dark:text-amber-200',
        accentBorder: 'border-amber-400 dark:border-amber-500',
        metricLabel: `${currentActiveStreak} Days Active`,
      });
    }
  }

  // 3. Perfect Days (100% of habits checked off on that day)
  for (let dayAgo = 0; dayAgo < daysTracked; dayAgo++) {
    const statuses = Object.values(dailyMatrix[dayAgo]);
    const totalCount = statuses.length;
    const completedCount = statuses.filter(Boolean).length;

    if (totalCount >= 3 && completedCount === totalCount) {
      const eventDate = new Date(referenceDate);
      eventDate.setDate(referenceDate.getDate() - dayAgo);

      events.push({
        id: `perfect-day-${dayAgo}`,
        type: 'perfect_day',
        date: eventDate,
        dateStr: formatDate(eventDate),
        relativeDaysAgo: dayAgo,
        formattedRelative: getRelativeLabel(dayAgo),
        title: 'Perfect Day: 100% Completion',
        subtitle: `All ${totalCount} habits completed`,
        description: `Flawless execution! Every scheduled habit was fully checked off and accounted for.`,
        iconType: 'Star',
        xpEarned: 75,
        badgeLabel: 'Perfect Consistency',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        badgeText: 'text-emerald-800 dark:text-emerald-200',
        accentBorder: 'border-emerald-400 dark:border-emerald-600',
        metricLabel: `${totalCount}/${totalCount} Done`,
      });
    }
  }

  // Sort chronologically descending: most recent events first (daysAgo: 0 -> 29)
  return events.sort((a, b) => a.relativeDaysAgo - b.relativeDaysAgo);
}
