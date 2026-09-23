export type ScreenId = 'onboarding' | 'home' | 'add-habit' | 'analytics';

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Personal'
  | 'Mindfulness'
  | 'Work'
  | 'Finance'
  | 'Creative';

export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  thresholdDays: number;
  iconName: 'Flame' | 'Zap' | 'Award' | 'Trophy' | 'Crown' | 'ShieldCheck';
  tier: MilestoneTier;
  unlocked: boolean;
  progressDays: number;
  progressPercent: number;
  bestHabitName?: string;
  rewardTitle: string;
}

export const MILESTONE_DEFINITIONS: Omit<
  Milestone,
  'unlocked' | 'progressDays' | 'progressPercent' | 'bestHabitName'
>[] = [
  {
    id: 'streak-3',
    name: 'Spark Starter',
    description: 'Build your initial momentum with a 3-day habit streak.',
    thresholdDays: 3,
    iconName: 'Flame',
    tier: 'bronze',
    rewardTitle: 'Bronze Sparkler Badge',
  },
  {
    id: 'streak-7',
    name: 'Consistency Champion',
    description: 'Conquer a full 7-day week of continuous consistency.',
    thresholdDays: 7,
    iconName: 'Zap',
    tier: 'silver',
    rewardTitle: 'Silver Weekmaster Badge',
  },
  {
    id: 'streak-14',
    name: 'Fortnight Focus',
    description: 'Sustain uninterrupted daily discipline for 14 straight days.',
    thresholdDays: 14,
    iconName: 'Award',
    tier: 'gold',
    rewardTitle: 'Golden Vanguard Badge',
  },
  {
    id: 'streak-21',
    name: 'Habit Builder',
    description: 'Reach 21 days: the scientific milestone for cementing lasting habits.',
    thresholdDays: 21,
    iconName: 'Trophy',
    tier: 'platinum',
    rewardTitle: 'Platinum Habit Maker Badge',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Unlock legendary 30-day consistency across an entire month.',
    thresholdDays: 30,
    iconName: 'Crown',
    tier: 'diamond',
    rewardTitle: 'Diamond Crown Badge',
  },
  {
    id: 'streak-60',
    name: 'Century Titan',
    description: 'Maintain unflinching mastery for 60 consecutive days.',
    thresholdDays: 60,
    iconName: 'ShieldCheck',
    tier: 'diamond',
    rewardTitle: 'Grand Titan Shield',
  },
];

export function getActiveMilestones(habits: Habit[]): Milestone[] {
  const habitStreaks = habits.map((h) => ({
    name: h.name,
    streak: calculateHabitStreak(h.completionHistory, h.completed),
  }));

  const bestStreak = habitStreaks.length > 0 ? Math.max(0, ...habitStreaks.map((s) => s.streak)) : 0;
  const bestHabit = habitStreaks.find((s) => s.streak === bestStreak);

  return MILESTONE_DEFINITIONS.map((def) => {
    const progressDays = Math.min(def.thresholdDays, bestStreak);
    const progressPercent = Math.min(100, Math.round((bestStreak / def.thresholdDays) * 100));
    const unlocked = bestStreak >= def.thresholdDays;

    return {
      ...def,
      unlocked,
      progressDays,
      progressPercent,
      bestHabitName: bestHabit?.name,
    };
  });
}

export type MoodId = 'energized' | 'accomplished' | 'calm' | 'neutral' | 'tired';

export interface MoodOption {
  id: MoodId;
  emoji: string;
  label: string;
  description: string;
  color: string;
  bgSoft: string;
  ringColor: string;
  badgeBg: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'energized',
    emoji: '⚡️',
    label: 'Energized',
    description: 'Vibrant, motivated & ready to conquer goals',
    color: 'text-amber-600',
    bgSoft: 'bg-amber-50',
    ringColor: 'ring-amber-400 border-amber-300',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  {
    id: 'accomplished',
    emoji: '🤩',
    label: 'Accomplished',
    description: 'Proud, triumphant & fulfilling personal mastery',
    color: 'text-emerald-600',
    bgSoft: 'bg-emerald-50',
    ringColor: 'ring-emerald-400 border-emerald-300',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  {
    id: 'calm',
    emoji: '🧘',
    label: 'Calm',
    description: 'Peaceful, centered & grounded in the present',
    color: 'text-teal-600',
    bgSoft: 'bg-teal-50',
    ringColor: 'ring-teal-400 border-teal-300',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
  },
  {
    id: 'neutral',
    emoji: '🙂',
    label: 'Neutral',
    description: 'Balanced, steady & maintaining consistency',
    color: 'text-sky-600',
    bgSoft: 'bg-sky-50',
    ringColor: 'ring-sky-400 border-sky-300',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  {
    id: 'tired',
    emoji: '😮‍💨',
    label: 'Challenging',
    description: 'Pushed through resistance or fatigue',
    color: 'text-purple-600',
    bgSoft: 'bg-purple-50',
    ringColor: 'ring-purple-400 border-purple-300',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
];

export interface HabitMoodEntry {
  date: string; // e.g. "2026-09-18"
  mood: MoodId;
  note?: string;
  loggedAt?: string;
}

export type HabitIconKey =
  | 'water'
  | 'exercise'
  | 'book'
  | 'meditate'
  | 'junk_food'
  | 'leaf'
  | 'moon'
  | 'sun'
  | 'heart'
  | 'flame'
  | 'bike'
  | 'footprints'
  | 'apple'
  | 'coffee'
  | 'brain'
  | 'music'
  | 'code'
  | 'palette'
  | 'smile'
  | 'target'
  | 'bed'
  | 'clock'
  | 'pill'
  | 'utensils'
  | 'wallet'
  | (string & {});

export type HabitSortOption = 'Most Frequent' | 'Highest Streak' | 'Recent';

export type FrequencyPeriod = 'day' | 'week' | 'month';
export type TargetFrequencyMode = 'everyday' | 'times_per_week' | 'times_per_month' | 'specific_days';

export interface TargetFrequency {
  mode: TargetFrequencyMode;
  timesPerPeriod: number;
  period: FrequencyPeriod;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  label: string;
}

export function formatTargetFrequency(tf?: TargetFrequency): string {
  if (!tf) return 'Every day';
  if (tf.label) return tf.label;
  if (tf.mode === 'everyday') return 'Every day';
  if (tf.mode === 'times_per_week') {
    return `${tf.timesPerPeriod} ${tf.timesPerPeriod === 1 ? 'time' : 'times'} a week`;
  }
  if (tf.mode === 'times_per_month') {
    return `${tf.timesPerPeriod} ${tf.timesPerPeriod === 1 ? 'time' : 'times'} a month`;
  }
  if (tf.mode === 'specific_days' && tf.daysOfWeek && tf.daysOfWeek.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return tf.daysOfWeek.map((d) => dayNames[d]).join(', ');
  }
  return 'Every day';
}

export interface Habit {
  id: string;
  name: string;
  subtitle: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all';
  icon: HabitIconKey;
  completed: boolean;
  isActive?: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Custom' | string;
  targetFrequency?: TargetFrequency;
  category?: HabitCategory;
  categories?: HabitCategory[];
  reminderTime?: string;
  reminderEnabled?: boolean;
  streak?: number;
  completionHistory?: boolean[];
  createdAt?: number;
  // Emotional context & Mood Log
  todayMood?: MoodId;
  todayMoodNote?: string;
  todayMoodLoggedAt?: string;
  moodHistory?: (MoodId | null)[];
  moodEntries?: HabitMoodEntry[];
}

/**
 * Checks whether a habit is scheduled / active for a specific day of the week.
 * @param habit The habit to evaluate
 * @param dayOfWeek 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday (JS Date.getDay())
 */
export function isHabitScheduledForDay(habit: Habit, dayOfWeek: number): boolean {
  // If explicitly paused / marked inactive, it's not active
  if (habit.isActive === false) {
    return false;
  }

  // 1. Structured targetFrequency
  const tf = habit.targetFrequency;
  if (tf) {
    if (tf.mode === 'everyday') {
      return true;
    }
    if (tf.daysOfWeek && tf.daysOfWeek.length > 0) {
      return tf.daysOfWeek.includes(dayOfWeek);
    }
    if (tf.mode === 'specific_days') {
      return tf.daysOfWeek ? tf.daysOfWeek.includes(dayOfWeek) : true;
    }
    if (tf.mode === 'times_per_week' || tf.mode === 'times_per_month') {
      if (tf.daysOfWeek && tf.daysOfWeek.length > 0) {
        return tf.daysOfWeek.includes(dayOfWeek);
      }
      return true;
    }
  }

  // 2. Frequency fallback
  if (habit.frequency === 'Daily' || !habit.frequency) {
    return true;
  }

  return true;
}

export function calculateHabitStreak(
  completionHistory?: boolean[],
  completedToday: boolean = false,
  fallbackStreak?: number
): number {
  if (!completionHistory || completionHistory.length === 0) {
    if (fallbackStreak !== undefined && fallbackStreak > 0) {
      return completedToday ? fallbackStreak : Math.max(0, fallbackStreak - 1);
    }
    return completedToday ? 1 : 0;
  }

  // Count consecutive completions backwards from the most recent past entry
  let pastStreak = 0;
  for (let i = completionHistory.length - 1; i >= 0; i--) {
    if (completionHistory[i]) {
      pastStreak++;
    } else {
      break;
    }
  }

  return completedToday ? pastStreak + 1 : pastStreak;
}

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  incompleteHabitIds: string[];
  incompleteHabitNames: string[];
  read: boolean;
  type: 'daily_reminder' | 'hourly_reminder' | 'streak_alert' | 'system';
}

export interface ReminderSettings {
  enabled: boolean;
  scheduledTime: string; // e.g. "20:00"
  soundEnabled: boolean;
  notifyOnAllCompleted: boolean;
  lastNotifiedDate?: string;
  // Hourly reminder every 1 hr
  hourlyEnabled: boolean;
  hourlyIntervalHours: number; // default: 1 (every 1 hour)
  lastHourlyNotifiedTimestamp?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string; // e.g. "22:00"
  quietHoursEnd?: string; // e.g. "08:00"
}

