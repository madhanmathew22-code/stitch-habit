import { HabitCategory, HabitIconKey, TargetFrequency } from '../types';

export interface GoalRecommendation {
  id: string;
  name: string;
  category: HabitCategory;
  icon: HabitIconKey;
  targetFrequency: TargetFrequency;
  reminderTime: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  tag: string;
  description: string;
  benefit: string;
  popularityScore: number;
}

export const POPULAR_GOAL_RECOMMENDATIONS: GoalRecommendation[] = [
  // Health Category
  {
    id: 'health-sleep-8hrs',
    name: '8 Hours of Sleep',
    category: 'Health',
    icon: 'bed',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '10:30 PM',
    timeOfDay: 'evening',
    tag: 'Doctor Recommended',
    description: 'Protect 8 hours of restorative deep and REM sleep nightly.',
    benefit: 'Enhances cognitive recovery, immune defense, and morning vitality.',
    popularityScore: 98,
  },
  {
    id: 'health-hydrate-2l',
    name: 'Drink 2L of Water',
    category: 'Health',
    icon: 'water',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '08:00 AM',
    timeOfDay: 'morning',
    tag: 'Most Popular',
    description: 'Keep a full water bottle close and hit daily hydration targets.',
    benefit: 'Boosts energy, improves digestion, and supports mental alertness.',
    popularityScore: 97,
  },
  {
    id: 'health-morning-sunlight',
    name: 'Morning Sunlight Exposure',
    category: 'Health',
    icon: 'sun',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '07:30 AM',
    timeOfDay: 'morning',
    tag: 'Circadian Sync',
    description: 'Get 10-15 minutes of outdoor sunlight within 1 hour of waking.',
    benefit: 'Synchronizes your circadian rhythm and primes evening melatonin.',
    popularityScore: 92,
  },
  {
    id: 'health-daily-vitamins',
    name: 'Take Daily Multivitamins',
    category: 'Health',
    icon: 'pill',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '08:30 AM',
    timeOfDay: 'morning',
    tag: 'Daily Essential',
    description: 'Take required supplements, Omega-3s, or prescribed vitamins.',
    benefit: 'Fills micronutrient gaps to support long-term cellular wellness.',
    popularityScore: 89,
  },
  {
    id: 'health-whole-foods',
    name: 'Eat Whole Food Greens',
    category: 'Health',
    icon: 'apple',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '12:30 PM',
    timeOfDay: 'afternoon',
    tag: 'Clean Nutrition',
    description: 'Incorporate fresh vegetables and fibrous whole foods into lunch.',
    benefit: 'Stabilizes blood sugar and fuels gut microbiome longevity.',
    popularityScore: 86,
  },
  {
    id: 'health-caffeine-cutoff',
    name: 'Caffeine Cutoff by 2 PM',
    category: 'Health',
    icon: 'coffee',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '02:00 PM',
    timeOfDay: 'afternoon',
    tag: 'Sleep Hygiene',
    description: 'Switch to water or herbal tea after 2:00 PM to clear adenosine receptors.',
    benefit: 'Significantly improves sleep architecture and REM density.',
    popularityScore: 84,
  },

  // Fitness Category
  {
    id: 'fitness-strength-gym',
    name: 'Strength Training Workout',
    category: 'Fitness',
    icon: 'exercise',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 4,
      period: 'week',
      daysOfWeek: [1, 3, 5, 6],
      label: '4 times a week',
    },
    reminderTime: '05:30 PM',
    timeOfDay: 'evening',
    tag: 'High Impact',
    description: 'Complete 45 minutes of progressive resistance or weights.',
    benefit: 'Builds lean muscle mass, metabolic rate, and bone density.',
    popularityScore: 95,
  },
  {
    id: 'fitness-10k-steps',
    name: '10,000 Daily Steps',
    category: 'Fitness',
    icon: 'footprints',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '06:00 PM',
    timeOfDay: 'afternoon',
    tag: 'Active Lifestyle',
    description: 'Keep active throughout the day with brisk walking breaks.',
    benefit: 'Maintains steady non-exercise physical activity and heart health.',
    popularityScore: 94,
  },
  {
    id: 'fitness-cardio-run',
    name: '30-Min Cardio Run',
    category: 'Fitness',
    icon: 'heart',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 3,
      period: 'week',
      daysOfWeek: [2, 4, 6],
      label: '3 times a week',
    },
    reminderTime: '07:00 AM',
    timeOfDay: 'morning',
    tag: 'Cardio Vitality',
    description: 'Zone 2 running or brisk jogging session.',
    benefit: 'Strengthens cardiovascular output and triggers endorphin release.',
    popularityScore: 91,
  },
  {
    id: 'fitness-cycling-session',
    name: 'Cycling or Spin Ride',
    category: 'Fitness',
    icon: 'bike',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 3,
      period: 'week',
      daysOfWeek: [2, 4, 0],
      label: '3 times a week',
    },
    reminderTime: '08:00 AM',
    timeOfDay: 'morning',
    tag: 'Endurance',
    description: 'Outdoor trail ride or indoor stationary bike interval.',
    benefit: 'High-calorie burn with low joint impact.',
    popularityScore: 82,
  },

  // Mindfulness Category
  {
    id: 'mindful-meditation',
    name: '10-Min Breathwork & Meditation',
    category: 'Mindfulness',
    icon: 'meditate',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '07:00 AM',
    timeOfDay: 'morning',
    tag: 'Mindful Calm',
    description: 'Box breathing or seated silent mindfulness practice.',
    benefit: 'Calms sympathetic fight-or-flight response and centers focus.',
    popularityScore: 96,
  },
  {
    id: 'mindful-gratitude',
    name: 'Daily Gratitude Journaling',
    category: 'Mindfulness',
    icon: 'smile',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '09:30 PM',
    timeOfDay: 'evening',
    tag: 'Positive Mindset',
    description: 'Note 3 specific moments or people you appreciate today.',
    benefit: 'Fosters optimism, psychological resilience, and emotional peace.',
    popularityScore: 90,
  },
  {
    id: 'mindful-nature-walk',
    name: '20-Min Nature Walk',
    category: 'Mindfulness',
    icon: 'leaf',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 4,
      period: 'week',
      daysOfWeek: [1, 3, 5, 0],
      label: '4 times a week',
    },
    reminderTime: '05:00 PM',
    timeOfDay: 'afternoon',
    tag: 'Mental Reset',
    description: 'Walk through a park or tree-lined path without headphones.',
    benefit: 'Alleviates mental fatigue and reconnects senses with nature.',
    popularityScore: 85,
  },
  {
    id: 'mindful-wind-down',
    name: 'Screen-Free Wind Down',
    category: 'Mindfulness',
    icon: 'moon',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '10:00 PM',
    timeOfDay: 'evening',
    tag: 'Night Ritual',
    description: 'Dim screens 45 minutes before sleep to foster natural drowsing.',
    benefit: 'Reduces dopamine spikes and prepares nervous system for rest.',
    popularityScore: 88,
  },

  // Learning Category
  {
    id: 'learning-read-book',
    name: 'Read 20 Pages of a Book',
    category: 'Learning',
    icon: 'book',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '08:30 PM',
    timeOfDay: 'evening',
    tag: 'Continuous Growth',
    description: 'Read non-fiction, philosophy, or literature attentively.',
    benefit: 'Expands mental models and builds long-form reading stamina.',
    popularityScore: 95,
  },
  {
    id: 'learning-deep-study',
    name: '45-Min Deep Focus Study',
    category: 'Learning',
    icon: 'brain',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 4,
      period: 'week',
      daysOfWeek: [1, 2, 4, 5],
      label: '4 times a week',
    },
    reminderTime: '10:00 AM',
    timeOfDay: 'morning',
    tag: 'Deliberate Practice',
    description: 'Immerse in an online course, language lesson, or technical book.',
    benefit: 'Accelerates skill acquisition through distraction-free immersion.',
    popularityScore: 89,
  },

  // Personal Category
  {
    id: 'personal-plan-day',
    name: "Plan Tomorrow's 3 Priorities",
    category: 'Personal',
    icon: 'target',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '09:00 PM',
    timeOfDay: 'evening',
    tag: 'Daily Direction',
    description: 'Clarify the 3 key wins before closing your workday.',
    benefit: 'Wipes away morning ambiguity so you launch directly into action.',
    popularityScore: 91,
  },
  {
    id: 'personal-tidy-space',
    name: 'Tidy & Reset Living Space',
    category: 'Personal',
    icon: 'leaf',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '07:30 PM',
    timeOfDay: 'evening',
    tag: 'Environment Reset',
    description: '10-minute clean sweep of desk, kitchen counters, and bedroom.',
    benefit: 'An orderly external space reduces cognitive load and anxiety.',
    popularityScore: 87,
  },

  // Work Category
  {
    id: 'work-pomodoro-focus',
    name: '2 Hours Uninterrupted Deep Work',
    category: 'Work',
    icon: 'clock',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 5,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4, 5],
      label: '5 times a week',
    },
    reminderTime: '09:00 AM',
    timeOfDay: 'morning',
    tag: 'High Productivity',
    description: 'Silence notifications and deliver on high-leverage deliverables.',
    benefit: 'Generates peak cognitive output without context-switching drag.',
    popularityScore: 93,
  },
  {
    id: 'work-coding-practice',
    name: 'Code or Technical Practice',
    category: 'Work',
    icon: 'code',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 4,
      period: 'week',
      daysOfWeek: [1, 2, 3, 4],
      label: '4 times a week',
    },
    reminderTime: '02:00 PM',
    timeOfDay: 'afternoon',
    tag: 'Engineering Craft',
    description: 'Refactor clean code, solve algorithmic puzzles, or build tools.',
    benefit: 'Compounds technical mastery and engineering confidence.',
    popularityScore: 88,
  },

  // Finance Category
  {
    id: 'finance-expense-tracker',
    name: 'Track Daily Expenses',
    category: 'Finance',
    icon: 'wallet',
    targetFrequency: {
      mode: 'everyday',
      timesPerPeriod: 7,
      period: 'week',
      label: 'Every day',
    },
    reminderTime: '08:00 PM',
    timeOfDay: 'evening',
    tag: 'Financial Discipline',
    description: 'Record any transactions made today into your tracking sheet.',
    benefit: 'Creates immediate accountability and curbs unconscious spending.',
    popularityScore: 90,
  },
  {
    id: 'finance-budget-review',
    name: 'Weekly Budget & Savings Review',
    category: 'Finance',
    icon: 'wallet',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 1,
      period: 'week',
      daysOfWeek: [0],
      label: '1 time a week',
    },
    reminderTime: '10:00 AM',
    timeOfDay: 'morning',
    tag: 'Wealth Building',
    description: 'Check net balances, savings goals, and upcoming bills.',
    benefit: 'Maintains alignment with financial independence goals.',
    popularityScore: 84,
  },

  // Creative Category
  {
    id: 'creative-daily-sketch',
    name: 'Daily Sketching & Design',
    category: 'Creative',
    icon: 'palette',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 4,
      period: 'week',
      daysOfWeek: [1, 3, 5, 6],
      label: '4 times a week',
    },
    reminderTime: '07:00 PM',
    timeOfDay: 'evening',
    tag: 'Visual Expression',
    description: 'Practice sketching, color exploration, or digital UI design.',
    benefit: 'Unlocks lateral thinking and refreshes creative intuition.',
    popularityScore: 87,
  },
  {
    id: 'creative-music-practice',
    name: 'Instrument & Music Flow',
    category: 'Creative',
    icon: 'music',
    targetFrequency: {
      mode: 'times_per_week',
      timesPerPeriod: 3,
      period: 'week',
      daysOfWeek: [2, 4, 6],
      label: '3 times a week',
    },
    reminderTime: '06:30 PM',
    timeOfDay: 'evening',
    tag: 'Acoustic Joy',
    description: 'Play guitar, piano, or practice musical ear training for 20 mins.',
    benefit: 'Enhances neuro-motor coordination and provides pure expressive joy.',
    popularityScore: 83,
  },
];

/**
 * Returns goal recommendations tailored to selected categories.
 * If multiple categories are selected, it surfaces suggestions matching any of them.
 * If no category is selected, it defaults to top universal suggestions across all categories.
 */
export function getGoalRecommendationsForCategories(
  categories: HabitCategory[] = ['Health'],
  activeCategoryFilter?: HabitCategory | 'All'
): GoalRecommendation[] {
  // If user explicitly chose a sub-filter
  if (activeCategoryFilter && activeCategoryFilter !== 'All') {
    return POPULAR_GOAL_RECOMMENDATIONS.filter(
      (item) => item.category === activeCategoryFilter
    ).sort((a, b) => b.popularityScore - a.popularityScore);
  }

  // If specific categories are selected in the form
  if (categories && categories.length > 0) {
    const matched = POPULAR_GOAL_RECOMMENDATIONS.filter((item) =>
      categories.includes(item.category)
    );

    if (matched.length > 0) {
      return matched.sort((a, b) => b.popularityScore - a.popularityScore);
    }
  }

  // Fallback: top recommendations across the entire library
  return [...POPULAR_GOAL_RECOMMENDATIONS].sort(
    (a, b) => b.popularityScore - a.popularityScore
  );
}
