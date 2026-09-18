import { HabitCategory } from '../types';

export interface CategoryDefinition {
  id: HabitCategory;
  label: string;
  emoji: string;
  description: string;
  bgLight: string;
  textLight: string;
  borderLight: string;
  activeColor: string;
  tagClass: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'Health',
    label: 'Health',
    emoji: '❤️',
    description: 'Vitality, hydration, nutrition & medical wellness',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    activeColor: 'bg-rose-500 text-white',
    tagClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  {
    id: 'Fitness',
    label: 'Fitness',
    emoji: '⚡',
    description: 'Workouts, cardio, steps & physical conditioning',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    borderLight: 'border-amber-200',
    activeColor: 'bg-amber-500 text-white',
    tagClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  {
    id: 'Learning',
    label: 'Learning',
    emoji: '📚',
    description: 'Reading, study, skill development & intellectual focus',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    activeColor: 'bg-blue-500 text-white',
    tagClass: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  },
  {
    id: 'Personal',
    label: 'Personal',
    emoji: '🌱',
    description: 'Lifestyle habits, home organization & self-care rituals',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    activeColor: 'bg-emerald-600 text-white',
    tagClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  {
    id: 'Mindfulness',
    label: 'Mindfulness',
    emoji: '🧘',
    description: 'Meditation, emotional balance & gratitude journaling',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    borderLight: 'border-teal-200',
    activeColor: 'bg-teal-600 text-white',
    tagClass: 'bg-teal-50 text-teal-700 border border-teal-200/80',
  },
  {
    id: 'Work',
    label: 'Work',
    emoji: '💼',
    description: 'Career projects, deep focus sessions & productivity',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    borderLight: 'border-indigo-200',
    activeColor: 'bg-indigo-600 text-white',
    tagClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  },
  {
    id: 'Finance',
    label: 'Finance',
    emoji: '💰',
    description: 'Expense budgeting, investments & conscious spending',
    bgLight: 'bg-green-50',
    textLight: 'text-green-700',
    borderLight: 'border-green-200',
    activeColor: 'bg-green-600 text-white',
    tagClass: 'bg-green-50 text-green-700 border border-green-200/80',
  },
  {
    id: 'Creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Art, music practice, writing & creative design',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    borderLight: 'border-purple-200',
    activeColor: 'bg-purple-600 text-white',
    tagClass: 'bg-purple-50 text-purple-700 border border-purple-200/80',
  },
];

export function getCategoryDefinition(categoryId?: HabitCategory | string): CategoryDefinition {
  const found = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  if (found) return found;
  return CATEGORY_DEFINITIONS[0]; // Health fallback
}
