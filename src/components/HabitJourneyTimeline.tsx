import React, { useState, useMemo } from 'react';
import {
  Flame,
  Zap,
  Award,
  Trophy,
  Crown,
  ShieldCheck,
  Star,
  Sparkles,
  Check,
  Filter,
  Calendar,
  ChevronRight,
  X,
  Compass,
  TrendingUp,
} from 'lucide-react';
import { Habit } from '../types';
import {
  HabitJourneyEvent,
  JourneyEventType,
  buildHabitJourneyTimeline,
} from '../utils/habitJourneyBuilder';
import { getHabitIconDefinition } from './habitIconsData';

interface HabitJourneyTimelineProps {
  habits: Habit[];
  className?: string;
}

export default function HabitJourneyTimeline({ habits, className = '' }: HabitJourneyTimelineProps) {
  const [filter, setFilter] = useState<'all' | JourneyEventType>('all');
  const [selectedEvent, setSelectedEvent] = useState<HabitJourneyEvent | null>(null);

  // Generate timeline events from actual habit completion data for the last 30 days
  const events = useMemo(() => {
    return buildHabitJourneyTimeline(habits);
  }, [habits]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  // Aggregate stats over the last month
  const stats = useMemo(() => {
    const milestonesCount = events.filter((e) => e.type === 'milestone').length;
    const streaksCount = events.filter((e) => e.type === 'streak').length;
    const perfectDaysCount = events.filter((e) => e.type === 'perfect_day').length;
    const totalXp = events.reduce((acc, curr) => acc + curr.xpEarned, 0);

    return {
      milestonesCount,
      streaksCount,
      perfectDaysCount,
      totalXp,
      totalEvents: events.length,
    };
  }, [events]);

  const renderEventIcon = (iconType: HabitJourneyEvent['iconType']) => {
    const size = 'w-4 h-4 stroke-[2.2]';
    switch (iconType) {
      case 'Crown':
        return <Crown className={size} />;
      case 'Trophy':
        return <Trophy className={size} />;
      case 'Award':
        return <Award className={size} />;
      case 'Zap':
        return <Zap className={size} />;
      case 'Flame':
        return <Flame className={size} />;
      case 'Star':
        return <Star className={size} />;
      case 'ShieldCheck':
        return <ShieldCheck className={size} />;
      default:
        return <Sparkles className={size} />;
    }
  };

  const getNodeColors = (event: HabitJourneyEvent) => {
    if (event.type === 'milestone') {
      switch (event.milestoneTier) {
        case 'diamond':
          return {
            bg: 'bg-gradient-to-tr from-cyan-500 to-sky-400 text-white shadow-cyan-200 dark:shadow-cyan-950',
            ring: 'ring-cyan-400/40',
            border: 'border-cyan-200 dark:border-cyan-800',
          };
        case 'platinum':
          return {
            bg: 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-indigo-200 dark:shadow-indigo-950',
            ring: 'ring-indigo-400/40',
            border: 'border-indigo-200 dark:border-indigo-800',
          };
        case 'gold':
          return {
            bg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-200 dark:shadow-amber-950',
            ring: 'ring-amber-400/40',
            border: 'border-amber-200 dark:border-amber-800',
          };
        case 'silver':
          return {
            bg: 'bg-gradient-to-tr from-slate-500 to-slate-400 text-white shadow-slate-200 dark:shadow-slate-900',
            ring: 'ring-slate-300/40',
            border: 'border-slate-200 dark:border-slate-700',
          };
        default: // bronze
          return {
            bg: 'bg-gradient-to-tr from-orange-500 to-amber-600 text-white shadow-orange-200 dark:shadow-orange-950',
            ring: 'ring-orange-300/40',
            border: 'border-orange-200 dark:border-orange-800',
          };
      }
    }

    if (event.type === 'perfect_day') {
      return {
        bg: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-200 dark:shadow-emerald-950',
        ring: 'ring-emerald-400/40',
        border: 'border-emerald-200 dark:border-emerald-800',
      };
    }

    // Default streak
    return {
      bg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-200 dark:shadow-amber-950',
      ring: 'ring-amber-300/40',
      border: 'border-amber-200 dark:border-amber-800',
    };
  };

  return (
    <section
      id="habit-journey-timeline-section"
      data-purpose="habit-journey"
      className={`bg-white dark:bg-slate-800 rounded-3xl p-4.5 shadow-sm border border-slate-100/90 dark:border-slate-700/80 space-y-4 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 stroke-[2.4]" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Habit Journey
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
              Last 30 Days
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological breakthroughs, completed milestones, and streaks.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
            Journey XP
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            +{stats.totalXp} XP
          </span>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
        <div className="text-center">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block">
            Milestones
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {stats.milestonesCount}
          </span>
        </div>
        <div className="text-center border-x border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block">
            Top Streaks
          </span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {stats.streaksCount > 0 ? stats.streaksCount : 'Active'}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block">
            Perfect Days
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {stats.perfectDaysCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          id="journey-filter-all"
          onClick={() => setFilter('all')}
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          All Events ({events.length})
        </button>

        <button
          type="button"
          id="journey-filter-milestone"
          onClick={() => setFilter('milestone')}
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filter === 'milestone'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          🏆 Milestones ({stats.milestonesCount})
        </button>

        <button
          type="button"
          id="journey-filter-streak"
          onClick={() => setFilter('streak')}
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filter === 'streak'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          🔥 Streaks ({stats.streaksCount})
        </button>

        <button
          type="button"
          id="journey-filter-perfect"
          onClick={() => setFilter('perfect_day')}
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filter === 'perfect_day'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          ✨ Perfect Days ({stats.perfectDaysCount})
        </button>
      </div>

      {/* Vertical Scrollable Timeline List */}
      <div
        id="habit-journey-timeline-scroll"
        className="max-h-[460px] overflow-y-auto no-scrollbar relative pr-1 pt-2 space-y-4"
      >
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No events found for this filter in the last 30 days.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-indigo-400 before:via-emerald-400 before:to-slate-200 dark:before:to-slate-700">
            {filteredEvents.map((item, idx) => {
              const nodeColor = getNodeColors(item);
              const iconDef = item.habitIcon ? getHabitIconDefinition(item.habitIcon) : null;

              return (
                <div
                  key={item.id}
                  id={`journey-event-${item.id}`}
                  onClick={() => setSelectedEvent(item)}
                  className="group relative flex items-start gap-3 cursor-pointer"
                >
                  {/* Timeline Node Point on Rail */}
                  <div
                    className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-800 shrink-0 transition-transform group-hover:scale-110 ${nodeColor.bg}`}
                  >
                    {renderEventIcon(item.iconType)}
                  </div>

                  {/* Event Content Card */}
                  <div className="w-full bg-[#f8fafc]/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-750 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/80 shadow-2xs group-hover:shadow-sm transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600">
                    {/* Top Row: Date & Badge */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                          {item.formattedRelative}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                          • {item.dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}
                        >
                          {item.badgeLabel}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/80 dark:border-emerald-800/80">
                          +{item.xpEarned} XP
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title & Habit */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>

                      {iconDef && (
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
                          title={item.habitName}
                        >
                          <span>{iconDef.emoji}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Subtitle / Footer detail */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </span>
                      <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Event Detail Modal / Drawer */}
      {selectedEvent && (
        <div
          id="journey-event-detail-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Breakthrough Spotlight
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedEvent.badgeBg}`}
                >
                  {selectedEvent.badgeLabel}
                </span>
              </div>
              <button
                type="button"
                id="close-journey-detail-btn"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Achievement Icon Big Display */}
            <div className="text-center py-2 space-y-2">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  getNodeColors(selectedEvent).bg
                }`}
              >
                {renderEventIcon(selectedEvent.iconType)}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {selectedEvent.dateStr} • {selectedEvent.formattedRelative}
              </p>
            </div>

            {/* Content card inside modal */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Associated Habit</span>
                <strong className="text-slate-800 dark:text-slate-200 font-bold">
                  {selectedEvent.habitName || 'All Daily Habits'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>XP Awarded</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  +{selectedEvent.xpEarned} XP
                </strong>
              </div>
              {selectedEvent.streakCount && (
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Streak Length</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">
                    {selectedEvent.streakCount} Consecutive Days
                  </strong>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            {/* Close / Celebrate button */}
            <button
              type="button"
              id="confirm-journey-detail-btn"
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer text-center"
            >
              Keep The Momentum Going
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
