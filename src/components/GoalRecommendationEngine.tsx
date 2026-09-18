import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Flame,
  ArrowRight,
  Clock,
  Compass,
  Info,
} from 'lucide-react';
import { HabitCategory, HabitIconKey, TargetFrequency } from '../types';
import {
  GoalRecommendation,
  getGoalRecommendationsForCategories,
} from '../utils/goalRecommendations';
import { getHabitIconDefinition } from './habitIconsData';
import { getCategoryDefinition } from '../utils/categoryData';

interface GoalRecommendationEngineProps {
  selectedCategories: HabitCategory[];
  currentHabitName: string;
  onApplyRecommendation: (recommendation: GoalRecommendation) => void;
  className?: string;
}

export default function GoalRecommendationEngine({
  selectedCategories,
  currentHabitName,
  onApplyRecommendation,
  className = '',
}: GoalRecommendationEngineProps) {
  // Allow user to switch between currently selected categories if multiple exist
  const [activeCategoryTab, setActiveCategoryTab] = useState<HabitCategory | 'All'>('All');
  const [appliedGoalId, setAppliedGoalId] = useState<string | null>(null);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<GoalRecommendation | null>(null);

  // Determine effective category tabs
  const availableTabs = useMemo(() => {
    if (selectedCategories.length <= 1) {
      return [];
    }
    return ['All', ...selectedCategories] as (HabitCategory | 'All')[];
  }, [selectedCategories]);

  // Retrieve recommendations based on category context
  const recommendations = useMemo(() => {
    return getGoalRecommendationsForCategories(selectedCategories, activeCategoryTab);
  }, [selectedCategories, activeCategoryTab]);

  // Primary category badge for header
  const primaryCategory = selectedCategories[0] || 'Health';
  const categoryDef = getCategoryDefinition(primaryCategory);

  const handleApply = (goal: GoalRecommendation) => {
    onApplyRecommendation(goal);
    setAppliedGoalId(goal.id);
    setTimeout(() => {
      setAppliedGoalId(null);
    }, 2400);
  };

  return (
    <div
      id="goal-recommendation-engine"
      data-purpose="goal-recommendations"
      className={`rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50/80 to-teal-50/50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-slate-700/80 p-3.5 space-y-3 transition-colors ${className}`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Goal Recommendations
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 inline-flex items-center gap-1">
                <span>{categoryDef.emoji}</span>
                <span>{selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Popular'}</span>
              </span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline">
          Tap to auto-fill
        </span>
      </div>

      {/* Subtitle / Context Note */}
      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
        Popular evidence-based habits suggested for your{' '}
        <strong className="text-slate-800 dark:text-slate-100 font-semibold">
          {selectedCategories.length > 0 ? selectedCategories.join(' & ') : 'selected'}
        </strong>{' '}
        goals:
      </p>

      {/* Sub-Category Tabs if multiple categories selected */}
      {availableTabs.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {availableTabs.map((tab) => {
            const isTabActive = activeCategoryTab === tab;
            return (
              <button
                key={tab}
                type="button"
                id={`recommendation-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveCategoryTab(tab)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white/80 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'All' ? 'All Selected' : tab}
              </button>
            );
          })}
        </div>
      )}

      {/* Recommendations Cards Carousel / Grid */}
      <div
        id="recommendations-scroll-container"
        className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 snap-x snap-mandatory"
      >
        {recommendations.map((goal) => {
          const iconDef = getHabitIconDefinition(goal.icon);
          const isCurrentTitle = currentHabitName.trim().toLowerCase() === goal.name.toLowerCase();
          const isJustApplied = appliedGoalId === goal.id;

          return (
            <div
              key={goal.id}
              id={`goal-recommendation-card-${goal.id}`}
              className={`shrink-0 w-[240px] sm:w-[250px] snap-start rounded-xl p-3 flex flex-col justify-between border transition-all cursor-pointer group select-none shadow-2xs ${
                isJustApplied
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                  : isCurrentTitle
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/80 ring-1 ring-emerald-400/50'
                  : 'bg-white dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200/90 dark:border-slate-700'
              }`}
              onClick={() => handleApply(goal)}
            >
              <div>
                {/* Top badges: Tag + Icon */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isJustApplied
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60'
                    }`}
                  >
                    {goal.tag}
                  </span>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isJustApplied
                        ? 'bg-white/20 text-white'
                        : `${iconDef.bgColor} ${iconDef.textColor}`
                    }`}
                  >
                    <span>{iconDef.emoji}</span>
                  </div>
                </div>

                {/* Habit Title */}
                <h4
                  className={`text-xs font-bold leading-snug line-clamp-1 ${
                    isJustApplied
                      ? 'text-white'
                      : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                  }`}
                >
                  {goal.name}
                </h4>

                {/* Benefit description */}
                <p
                  className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${
                    isJustApplied
                      ? 'text-emerald-50'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {goal.benefit}
                </p>
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1 text-[10px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded ${
                      isJustApplied
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    🎯 {goal.targetFrequency.label}
                  </span>
                  <span
                    className={`hidden sm:inline font-medium ${
                      isJustApplied ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    ⏰ {goal.reminderTime}
                  </span>
                </div>

                {/* Apply Button Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(goal);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    isJustApplied
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : isCurrentTitle
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60'
                  }`}
                >
                  {isJustApplied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" /> Applied!
                    </>
                  ) : isCurrentTitle ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </>
                  ) : (
                    <>
                      Apply <ArrowRight className="w-2.5 h-2.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
