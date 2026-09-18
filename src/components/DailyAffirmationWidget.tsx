import React, { useState, useEffect } from 'react';
import {
  DailyAffirmation,
  getAffirmationForDay,
  getRandomAffirmation,
} from '../utils/affirmationsData';
import { Sparkles, RefreshCw, Copy, Check, Heart, Quote } from 'lucide-react';

interface DailyAffirmationWidgetProps {
  className?: string;
}

export default function DailyAffirmationWidget({ className = '' }: DailyAffirmationWidgetProps) {
  // Start with today's deterministic quote
  const [affirmation, setAffirmation] = useState<DailyAffirmation>(() => getAffirmationForDay());
  const [isRotating, setIsRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`fav_affirmation_${affirmation.id}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Check liked status whenever affirmation changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fav_affirmation_${affirmation.id}`);
      setLiked(saved === 'true');
    } catch {
      setLiked(false);
    }
  }, [affirmation.id]);

  const handleShuffle = () => {
    setIsRotating(true);
    setTimeout(() => {
      setAffirmation((prev) => getRandomAffirmation(prev.id));
      setIsRotating(false);
    }, 200);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = `"${affirmation.quote}" — ${affirmation.author}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleLike = () => {
    const nextState = !liked;
    setLiked(nextState);
    try {
      if (nextState) {
        localStorage.setItem(`fav_affirmation_${affirmation.id}`, 'true');
      } else {
        localStorage.removeItem(`fav_affirmation_${affirmation.id}`);
      }
    } catch {
      // ignore
    }
  };

  // Theme-specific subtle colors
  const themeStyles: Record<
    DailyAffirmation['theme'],
    { badgeBg: string; badgeText: string; ringColor: string }
  > = {
    Mindfulness: {
      badgeBg: 'bg-teal-50 border-teal-200/80',
      badgeText: 'text-teal-700',
      ringColor: 'from-teal-500/10 to-emerald-500/10',
    },
    Resilience: {
      badgeBg: 'bg-amber-50 border-amber-200/80',
      badgeText: 'text-amber-700',
      ringColor: 'from-amber-500/10 to-orange-500/10',
    },
    Consistency: {
      badgeBg: 'bg-blue-50 border-blue-200/80',
      badgeText: 'text-blue-700',
      ringColor: 'from-blue-500/10 to-indigo-500/10',
    },
    Calm: {
      badgeBg: 'bg-sky-50 border-sky-200/80',
      badgeText: 'text-sky-700',
      ringColor: 'from-sky-500/10 to-cyan-500/10',
    },
    Growth: {
      badgeBg: 'bg-emerald-50 border-emerald-200/80',
      badgeText: 'text-emerald-700',
      ringColor: 'from-emerald-500/10 to-teal-500/10',
    },
    Gratitude: {
      badgeBg: 'bg-rose-50 border-rose-200/80',
      badgeText: 'text-rose-700',
      ringColor: 'from-rose-500/10 to-pink-500/10',
    },
  };

  const currentTheme = themeStyles[affirmation.theme] || themeStyles.Mindfulness;

  return (
    <div
      id="daily-affirmation-widget"
      data-purpose="daily-affirmation-widget"
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs p-3.5 transition-all mb-3 ${className}`}
    >
      {/* Background Soft Glow */}
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-linear-to-br ${currentTheme.ringColor} blur-2xl pointer-events-none opacity-80 dark:opacity-40`}
      />

      {/* Top Bar: Title, Category Badge, and Controls */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Daily Affirmation
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
          >
            <span>{affirmation.emoji}</span>
            <span>{affirmation.theme}</span>
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Favorite Button */}
          <button
            id="affirmation-favorite-btn"
            type="button"
            onClick={handleToggleLike}
            title={liked ? 'Saved in favorites' : 'Save to favorites'}
            aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              liked
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Copy Quote Button */}
          <button
            id="affirmation-copy-btn"
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard!' : 'Copy quote'}
            aria-label="Copy affirmation quote"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              copied
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Shuffle / Random Quote Button */}
          <button
            id="affirmation-shuffle-btn"
            type="button"
            onClick={handleShuffle}
            title="Get another mindful quote"
            aria-label="Get another mindful quote"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isRotating ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quote Body */}
      <div className="relative pl-3.5 border-l-2 border-emerald-500/40 dark:border-emerald-400/50 py-0.5">
        <Quote className="w-3 h-3 text-slate-300 dark:text-slate-600 absolute -left-1.5 -top-1 fill-slate-100 dark:fill-slate-700" />
        <p
          id="daily-affirmation-text"
          className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic select-text"
        >
          “{affirmation.quote}”
        </p>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 mt-1 not-italic flex items-center gap-1.5">
          <span>— {affirmation.author}</span>
          {copied && (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
              Copied!
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
