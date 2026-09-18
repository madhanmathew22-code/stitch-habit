import React, { useState } from 'react';
import { Zap, Sparkles, ChevronRight, Award, Trophy, Info, X, Flame } from 'lucide-react';
import { XPStats, XP_PER_HABIT, LEVEL_TIERS } from '../utils/xpSystem';

interface XPHeaderProgressBarProps {
  stats: XPStats;
  recentXpGained?: number | null;
  onOpenDetails?: () => void;
  className?: string;
}

export default function XPHeaderProgressBar({
  stats,
  recentXpGained,
  className = '',
}: XPHeaderProgressBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Header XP Progress Bar Container */}
      <div
        id="header-xp-bar-container"
        data-purpose="xp-header-progress-bar"
        className={`relative w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-2.5 px-3 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all hover:border-emerald-300 dark:hover:border-emerald-600/60 ${className}`}
      >
        {/* Floating animated +XP gain notification */}
        {recentXpGained && recentXpGained > 0 && (
          <div
            key={Date.now()}
            className="absolute -top-3.5 right-6 z-20 pointer-events-none animate-bounce"
          >
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <Zap className="w-3 h-3 fill-current" />
              +{recentXpGained} XP!
            </span>
          </div>
        )}

        {/* Top line: Level, XP tally, and Info trigger */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {/* Level Pill */}
          <button
            type="button"
            id="xp-header-level-badge-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer group text-left"
            title="Click to view XP Level Details"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <span>{stats.icon}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">
                Lvl {stats.level}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                • {stats.title}
              </span>
            </div>
          </button>

          {/* XP Progress Text and Detail Clicker */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-right cursor-pointer group"
          >
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-none">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {stats.currentLevelXp}
              </span>{' '}
              <span className="text-slate-400 dark:text-slate-500 font-medium">/</span>{' '}
              {stats.neededLevelXp} XP
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 group-hover:bg-emerald-100 transition-colors">
              +{stats.todayEarnedXp} Today
            </span>
          </button>
        </div>

        {/* The Animated Progress Bar Track */}
        <div
          role="progressbar"
          aria-valuenow={stats.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Level ${stats.level} Progress: ${stats.progressPercent}%`}
          onClick={() => setIsModalOpen(true)}
          className="relative w-full h-2 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden cursor-pointer group"
        >
          {/* Progress fill */}
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(4, stats.progressPercent)}%` }}
          />
        </div>

        {/* Sub-label showing next level requirement */}
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            Earn +{XP_PER_HABIT} XP per habit
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {stats.xpToNextLevel > 0
              ? `${stats.xpToNextLevel} XP to Level ${stats.level + 1}`
              : 'Max Level Reached!'}
          </button>
        </div>
      </div>

      {/* XP Level & Engagement Details Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
          data-purpose="xp-details-modal"
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Experience Points (XP)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Daily engagement & growth system
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Level Hero Card */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{stats.icon}</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Level {stats.level}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {stats.title}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white block leading-tight">
                    {stats.totalXp}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Total XP</span>
                </div>
              </div>

              {/* Progress Bar in Modal */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    {stats.currentLevelXp} / {stats.neededLevelXp} XP
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {stats.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-0.5">
                  {stats.xpToNextLevel} XP needed to reach Level {stats.level + 1}
                </p>
              </div>
            </div>

            {/* How XP Works Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                How to Earn XP
              </h5>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✅</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Complete Any Habit
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{XP_PER_HABIT} XP
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Today's Activity ({stats.completedTodayCount}/{stats.totalHabitsCount})
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{stats.todayEarnedXp} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progression Roadmap */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                Level Roadmap
              </h5>
              <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar pr-0.5">
                {LEVEL_TIERS.map((tier) => {
                  const isCurrent = tier.level === stats.level;
                  const isUnlocked = stats.totalXp >= tier.minXp;
                  return (
                    <div
                      key={tier.level}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs border ${
                        isCurrent
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 font-bold text-slate-900 dark:text-white'
                          : isUnlocked
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-700/40 text-slate-700 dark:text-slate-300'
                          : 'opacity-50 border-transparent text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tier.icon}</span>
                        <span>
                          Lvl {tier.level}: {tier.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {tier.minXp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Keep Earning
            </button>
          </div>
        </div>
      )}
    </>
  );
}
