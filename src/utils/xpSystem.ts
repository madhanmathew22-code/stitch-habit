import { Habit } from '../types';

export const XP_PER_HABIT = 25;
export const XP_STORAGE_KEY = 'habitflow_user_xp_v1';

export interface LevelThreshold {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
}

export const LEVEL_TIERS: LevelThreshold[] = [
  { level: 1, title: 'Mindful Initiate', minXp: 0, maxXp: 100, icon: '🌱' },
  { level: 2, title: 'Consistency Builder', minXp: 100, maxXp: 250, icon: '⚡' },
  { level: 3, title: 'Momentum Maker', minXp: 250, maxXp: 450, icon: '🔥' },
  { level: 4, title: 'Daily Champion', minXp: 450, maxXp: 700, icon: '⭐' },
  { level: 5, title: 'Habit Master', minXp: 700, maxXp: 1050, icon: '🏆' },
  { level: 6, title: 'Zen Practitioner', minXp: 1050, maxXp: 1500, icon: '🧘' },
  { level: 7, title: 'Unstoppable Titan', minXp: 1500, maxXp: 2100, icon: '👑' },
  { level: 8, title: 'Legendary Achiever', minXp: 2100, maxXp: 3000, icon: '💎' },
];

export interface XPStats {
  totalXp: number;
  level: number;
  title: string;
  icon: string;
  currentLevelXp: number;
  neededLevelXp: number;
  progressPercent: number;
  xpToNextLevel: number;
  todayEarnedXp: number;
  completedTodayCount: number;
  totalHabitsCount: number;
}

/**
 * Calculates user's level and progress details from total XP.
 */
export function calculateLevelStats(totalXp: number, habits: Habit[] = []): XPStats {
  const safeTotalXp = Math.max(0, totalXp);

  // Find corresponding tier
  let currentTier = LEVEL_TIERS[0];
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeTotalXp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
      break;
    }
  }

  // Handle beyond max tier
  const isMaxTier = currentTier.level === LEVEL_TIERS[LEVEL_TIERS.length - 1].level && safeTotalXp >= currentTier.maxXp;
  const minXp = currentTier.minXp;
  const maxXp = isMaxTier ? currentTier.maxXp + 1000 : currentTier.maxXp;

  const currentLevelXp = safeTotalXp - minXp;
  const neededLevelXp = maxXp - minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / neededLevelXp) * 100)));
  const xpToNextLevel = Math.max(0, maxXp - safeTotalXp);

  const completedTodayCount = habits.filter((h) => h.completed).length;
  const todayEarnedXp = completedTodayCount * XP_PER_HABIT;

  return {
    totalXp: safeTotalXp,
    level: currentTier.level,
    title: currentTier.title,
    icon: currentTier.icon,
    currentLevelXp,
    neededLevelXp,
    progressPercent,
    xpToNextLevel,
    todayEarnedXp,
    completedTodayCount,
    totalHabitsCount: habits.length,
  };
}

/**
 * Computes a baseline initial XP based on default historical completions
 * so returning users start with meaningful progression.
 */
export function getInitialDefaultXp(habits: Habit[]): number {
  let baseCount = 0;
  habits.forEach((h) => {
    // Count historical completions (capped to recent 14 days to keep starting level balanced)
    const recent = (h.completionHistory || []).slice(-14).filter(Boolean).length;
    baseCount += recent;
    if (h.completed) baseCount += 1;
  });

  // e.g. ~10 completions = 250 XP (Level 2 or 3)
  return Math.max(125, baseCount * XP_PER_HABIT);
}

/**
 * Retrieves XP from localStorage or generates initial default.
 */
export function getStoredTotalXp(habits: Habit[]): number {
  try {
    const saved = localStorage.getItem(XP_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch (err) {
    // Fallback if localStorage is inaccessible
  }

  const initial = getInitialDefaultXp(habits);
  saveStoredTotalXp(initial);
  return initial;
}

/**
 * Persists total XP to localStorage.
 */
export function saveStoredTotalXp(xp: number): void {
  try {
    localStorage.setItem(XP_STORAGE_KEY, String(Math.max(0, xp)));
  } catch (err) {
    // Ignore storage quota errors
  }
}
