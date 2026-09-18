export interface DailyAffirmation {
  id: string;
  quote: string;
  author: string;
  theme: 'Mindfulness' | 'Resilience' | 'Consistency' | 'Calm' | 'Growth' | 'Gratitude';
  emoji: string;
}

export const AFFIRMATIONS_LIST: DailyAffirmation[] = [
  {
    id: 'aff-1',
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    theme: 'Consistency',
    emoji: '⚡',
  },
  {
    id: 'aff-2',
    quote: 'Smile, breathe, and go slowly. There is nowhere to hurry; the moment is now.',
    author: 'Thich Nhat Hanh',
    theme: 'Mindfulness',
    emoji: '🌿',
  },
  {
    id: 'aff-3',
    quote: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.',
    author: 'John C. Maxwell',
    theme: 'Consistency',
    emoji: '🌱',
  },
  {
    id: 'aff-4',
    quote: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    theme: 'Resilience',
    emoji: '🛡️',
  },
  {
    id: 'aff-5',
    quote: 'Peace comes from within. Do not seek it without.',
    author: 'Siddhartha Gautama',
    theme: 'Calm',
    emoji: '🧘',
  },
  {
    id: 'aff-6',
    quote: 'Every action you take is a vote for the type of person you wish to become.',
    author: 'James Clear',
    theme: 'Growth',
    emoji: '🌟',
  },
  {
    id: 'aff-7',
    quote: 'Gratitude turns what we have into enough, and more. It turns denial into acceptance, chaos into order.',
    author: 'Melody Beattie',
    theme: 'Gratitude',
    emoji: '🙏',
  },
  {
    id: 'aff-8',
    quote: 'The secret of change is to focus all of your energy not on fighting the old, but on building the new.',
    author: 'Dan Millman',
    theme: 'Growth',
    emoji: '✨',
  },
  {
    id: 'aff-9',
    quote: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.',
    author: 'Thich Nhat Hanh',
    theme: 'Mindfulness',
    emoji: '☁️',
  },
  {
    id: 'aff-10',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    theme: 'Consistency',
    emoji: '🎯',
  },
  {
    id: 'aff-11',
    quote: 'Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.',
    author: 'Benjamin Franklin',
    theme: 'Calm',
    emoji: '☀️',
  },
  {
    id: 'aff-12',
    quote: 'A journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
    theme: 'Growth',
    emoji: '🚶',
  },
  {
    id: 'aff-13',
    quote: 'Today, give yourself permission to be a beginner. No one starts at the finish line.',
    author: 'Mindful Reminder',
    theme: 'Resilience',
    emoji: '🌱',
  },
  {
    id: 'aff-14',
    quote: 'Wherever you are, be there totally.',
    author: 'Eckhart Tolle',
    theme: 'Mindfulness',
    emoji: '🧘',
  },
  {
    id: 'aff-15',
    quote: 'Patience is not the ability to wait, but the ability to keep a good attitude while waiting.',
    author: 'Joyce Meyer',
    theme: 'Resilience',
    emoji: '⏳',
  },
  {
    id: 'aff-16',
    quote: 'In the midst of movement and chaos, keep stillness inside of you.',
    author: 'Deepak Chopra',
    theme: 'Calm',
    emoji: '🌊',
  },
  {
    id: 'aff-17',
    quote: 'When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.',
    author: 'Marcus Aurelius',
    theme: 'Gratitude',
    emoji: '🌅',
  },
  {
    id: 'aff-18',
    quote: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    theme: 'Consistency',
    emoji: '🐢',
  },
  {
    id: 'aff-19',
    quote: 'Be kind to your mind. Progress is made of quiet, gentle repetitions.',
    author: 'Mindful Affirmation',
    theme: 'Mindfulness',
    emoji: '🌸',
  },
  {
    id: 'aff-20',
    quote: 'Happiness is not something ready-made. It comes from your own actions.',
    author: 'Dalai Lama',
    theme: 'Growth',
    emoji: '💫',
  },
  {
    id: 'aff-21',
    quote: 'Let go of who you think you are supposed to be and embrace who you are.',
    author: 'Brené Brown',
    theme: 'Calm',
    emoji: '🕊️',
  },
  {
    id: 'aff-22',
    quote: 'The present moment is filled with joy and happiness. If you are attentive, you will see it.',
    author: 'Thich Nhat Hanh',
    theme: 'Mindfulness',
    emoji: '🍃',
  },
  {
    id: 'aff-23',
    quote: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
    theme: 'Consistency',
    emoji: '📈',
  },
  {
    id: 'aff-24',
    quote: 'Adopt the pace of nature: her secret is patience.',
    author: 'Ralph Waldo Emerson',
    theme: 'Calm',
    emoji: '🌲',
  },
];

/**
 * Calculates a deterministic daily index based on year, month, and day.
 * Ensures the same affirmation displays throughout a calendar day.
 */
export function getAffirmationForDay(date: Date = new Date()): DailyAffirmation {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  // Simple deterministic hash
  const dayOfYearHash = (year * 366 + month * 31 + day) % AFFIRMATIONS_LIST.length;
  return AFFIRMATIONS_LIST[dayOfYearHash];
}

export function getRandomAffirmation(excludeId?: string): DailyAffirmation {
  const pool = excludeId
    ? AFFIRMATIONS_LIST.filter((a) => a.id !== excludeId)
    : AFFIRMATIONS_LIST;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
