import { Habit, MoodId, MoodOption, MOOD_OPTIONS, HabitMoodEntry } from '../types';

export function getMoodOption(moodId?: MoodId | null): MoodOption | undefined {
  if (!moodId) return undefined;
  return MOOD_OPTIONS.find((m) => m.id === moodId);
}

export interface MoodStat {
  mood: MoodOption;
  count: number;
  percentage: number;
}

export interface HabitMoodAffinity {
  habitId: string;
  habitName: string;
  category?: string;
  icon: Habit['icon'];
  dominantMood: MoodOption;
  dominantMoodCount: number;
  totalMoodsLogged: number;
  affinityPercentage: number;
}

export interface MoodAnalyticsData {
  totalLogs: number;
  dominantMood?: MoodOption;
  dominantPercentage: number;
  moodStats: MoodStat[];
  habitAffinities: HabitMoodAffinity[];
  recentEntries: (HabitMoodEntry & { habitName: string; icon: Habit['icon'] })[];
}

export function computeMoodAnalytics(
  habits: Habit[],
  timeframe: 'weekly' | 'monthly' | 'yearly' = 'weekly'
): MoodAnalyticsData {
  // Determine how many days back from completionHistory to inspect
  const dayLimit = timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : 365;

  const counts: Record<MoodId, number> = {
    energized: 0,
    accomplished: 0,
    calm: 0,
    neutral: 0,
    tired: 0,
  };

  const habitAffinityMap: Record<
    string,
    {
      habit: Habit;
      moodCounts: Record<MoodId, number>;
      total: number;
    }
  > = {};

  const recentEntries: (HabitMoodEntry & { habitName: string; icon: Habit['icon'] })[] = [];

  // 1. Process today's mood for completed habits
  habits.forEach((habit) => {
    if (!habitAffinityMap[habit.id]) {
      habitAffinityMap[habit.id] = {
        habit,
        moodCounts: { energized: 0, accomplished: 0, calm: 0, neutral: 0, tired: 0 },
        total: 0,
      };
    }

    if (habit.completed && habit.todayMood) {
      counts[habit.todayMood] = (counts[habit.todayMood] || 0) + 1;
      habitAffinityMap[habit.id].moodCounts[habit.todayMood]++;
      habitAffinityMap[habit.id].total++;

      recentEntries.push({
        date: '2026-09-18',
        mood: habit.todayMood,
        note: habit.todayMoodNote || 'Today’s completion feeling',
        loggedAt: habit.todayMoodLoggedAt || 'Today',
        habitName: habit.name,
        icon: habit.icon,
      });
    }

    // 2. Process moodHistory matching completionHistory
    const moodHistory = habit.moodHistory || [];
    const sliceDays = moodHistory.slice(-dayLimit);

    sliceDays.forEach((mood, idx) => {
      if (mood && counts[mood] !== undefined) {
        counts[mood]++;
        habitAffinityMap[habit.id].moodCounts[mood]++;
        habitAffinityMap[habit.id].total++;

        // Synthesize recent entry date for demonstration
        if (recentEntries.length < 15) {
          const pastDaysAgo = sliceDays.length - idx;
          const entryDate = new Date(2026, 8, 18 - pastDaysAgo);
          const dateStr = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          recentEntries.push({
            date: dateStr,
            mood,
            note: idx % 3 === 0 ? 'Consistent progress feeling' : undefined,
            loggedAt: `${dateStr}`,
            habitName: habit.name,
            icon: habit.icon,
          });
        }
      }
    });

    // 3. Process any explicit moodEntries stored
    if (habit.moodEntries) {
      habit.moodEntries.forEach((entry) => {
        if (!recentEntries.some((r) => r.habitName === habit.name && r.date === entry.date)) {
          recentEntries.push({
            ...entry,
            habitName: habit.name,
            icon: habit.icon,
          });
        }
      });
    }
  });

  const totalLogs = Object.values(counts).reduce((a, b) => a + b, 0);

  // Compute stats per mood
  const moodStats: MoodStat[] = MOOD_OPTIONS.map((mood) => {
    const count = counts[mood.id] || 0;
    const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
    return {
      mood,
      count,
      percentage,
    };
  });

  // Find dominant mood
  let dominantMood: MoodOption | undefined;
  let dominantCount = -1;
  moodStats.forEach((stat) => {
    if (stat.count > dominantCount) {
      dominantCount = stat.count;
      dominantMood = stat.mood;
    }
  });
  const dominantPercentage = totalLogs > 0 ? Math.round((dominantCount / totalLogs) * 100) : 0;

  // Compute habit affinities
  const habitAffinities: HabitMoodAffinity[] = Object.values(habitAffinityMap)
    .filter((entry) => entry.total > 0)
    .map((entry) => {
      let topMoodId: MoodId = 'calm';
      let maxCount = -1;
      (Object.keys(entry.moodCounts) as MoodId[]).forEach((mid) => {
        if (entry.moodCounts[mid] > maxCount) {
          maxCount = entry.moodCounts[mid];
          topMoodId = mid;
        }
      });

      const opt = getMoodOption(topMoodId)!;
      const affinityPercentage = Math.round((maxCount / entry.total) * 100);

      return {
        habitId: entry.habit.id,
        habitName: entry.habit.name,
        category: entry.habit.category,
        icon: entry.habit.icon,
        dominantMood: opt,
        dominantMoodCount: maxCount,
        totalMoodsLogged: entry.total,
        affinityPercentage,
      };
    })
    .sort((a, b) => b.totalMoodsLogged - a.totalMoodsLogged);

  // Sort recent entries by recency
  const sortedRecent = recentEntries.slice(0, 8);

  return {
    totalLogs,
    dominantMood: totalLogs > 0 ? dominantMood : undefined,
    dominantPercentage,
    moodStats,
    habitAffinities,
    recentEntries: sortedRecent,
  };
}
