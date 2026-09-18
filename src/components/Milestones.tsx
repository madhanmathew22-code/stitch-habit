import { useState, useMemo } from 'react';
import {
  Flame,
  Zap,
  Award,
  Trophy,
  Crown,
  ShieldCheck,
  Lock,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Star,
} from 'lucide-react';
import { Habit, Milestone, getActiveMilestones } from '../types';

interface MilestonesProps {
  habits: Habit[];
  variant?: 'home' | 'profile';
  onViewAll?: () => void;
}

export default function Milestones({ habits, variant = 'home', onViewAll }: MilestonesProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const milestones = useMemo(() => getActiveMilestones(habits), [habits]);

  const unlockedCount = useMemo(
    () => milestones.filter((m) => m.unlocked).length,
    [milestones]
  );

  const bestStreak = useMemo(() => {
    return Math.max(0, ...milestones.map((m) => m.progressDays));
  }, [milestones]);

  const nextMilestone = useMemo(() => {
    return milestones.find((m) => !m.unlocked);
  }, [milestones]);

  const filteredMilestones = useMemo(() => {
    if (filter === 'unlocked') return milestones.filter((m) => m.unlocked);
    if (filter === 'locked') return milestones.filter((m) => !m.unlocked);
    return milestones;
  }, [milestones, filter]);

  const renderBadgeIcon = (iconName: Milestone['iconName'], size: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Flame':
        return <Flame className={size} />;
      case 'Zap':
        return <Zap className={size} />;
      case 'Award':
        return <Award className={size} />;
      case 'Trophy':
        return <Trophy className={size} />;
      case 'Crown':
        return <Crown className={size} />;
      case 'ShieldCheck':
        return <ShieldCheck className={size} />;
      default:
        return <Sparkles className={size} />;
    }
  };

  const getTierColors = (tier: Milestone['tier'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        cardBg: 'bg-slate-50/80 border-slate-200/60 text-slate-400',
        badgeBg: 'bg-slate-200/70 text-slate-400 border-slate-300',
        glow: '',
        accent: 'text-slate-400',
        pill: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    }

    switch (tier) {
      case 'bronze':
        return {
          cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/80 text-amber-900',
          badgeBg: 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-amber-200 border-amber-300',
          glow: 'ring-2 ring-amber-400/20 shadow-amber-100',
          accent: 'text-amber-600',
          pill: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'silver':
        return {
          cardBg: 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-slate-200 text-slate-900',
          badgeBg: 'bg-gradient-to-tr from-slate-400 to-slate-600 text-white shadow-md shadow-slate-200 border-slate-300',
          glow: 'ring-2 ring-slate-400/20 shadow-slate-100',
          accent: 'text-blue-600',
          pill: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case 'gold':
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 border-yellow-300 text-yellow-950',
          badgeBg: 'bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-400 text-white shadow-md shadow-yellow-200 border-yellow-200',
          glow: 'ring-2 ring-yellow-400/30 shadow-yellow-100',
          accent: 'text-yellow-600',
          pill: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
      case 'platinum':
        return {
          cardBg: 'bg-gradient-to-br from-purple-50 via-indigo-50/50 to-violet-50/40 border-purple-200 text-purple-950',
          badgeBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-200 border-purple-300',
          glow: 'ring-2 ring-purple-400/25 shadow-purple-100',
          accent: 'text-purple-600',
          pill: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'diamond':
        return {
          cardBg: 'bg-gradient-to-br from-cyan-50 via-sky-50/60 to-blue-50/40 border-cyan-200 text-cyan-950',
          badgeBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-200 border-cyan-200',
          glow: 'ring-2 ring-cyan-400/30 shadow-cyan-100',
          accent: 'text-cyan-600',
          pill: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        };
      default:
        return {
          cardBg: 'bg-white border-slate-200 text-slate-800',
          badgeBg: 'bg-emerald-500 text-white',
          glow: '',
          accent: 'text-emerald-600',
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
    }
  };

  // Render on Home Dashboard
  if (variant === 'home') {
    return (
      <section
        className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100/90 dark:border-slate-700/80"
        data-purpose="home-milestones-widget"
      >
        {/* Header with Title and Unlocked Counter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 border border-amber-200/70 dark:border-amber-800/60">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Streak Milestones</h2>
                <span
                  data-purpose="unlocked-counter-badge"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
                >
                  {unlockedCount}/{milestones.length} Badges
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-0.5">
                Best streak: <span className="font-semibold text-slate-700 dark:text-slate-300">{bestStreak} days</span> 🔥
              </p>
            </div>
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-[11px] font-semibold text-[#2F80ED] dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer py-1"
            >
              All Badges <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Badge Ribbon */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-0.5">
          {milestones.map((m) => {
            const styles = getTierColors(m.tier, m.unlocked);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMilestone(m)}
                className={`flex-shrink-0 w-24 p-2.5 rounded-xl border transition-all duration-200 text-center flex flex-col items-center group cursor-pointer active:scale-95 ${
                  m.unlocked
                    ? `${styles.cardBg} shadow-xs hover:shadow-md`
                    : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-700'
                }`}
                aria-label={`View milestone: ${m.name}`}
              >
                {/* Visual Medallion Badge */}
                <div className="relative mb-1.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-105 ${styles.badgeBg}`}
                  >
                    {renderBadgeIcon(m.iconName, 'w-5 h-5')}
                  </div>

                  {m.unlocked ? (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Badge Name & Days */}
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate w-full text-center">
                  {m.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {m.thresholdDays} Days
                </span>

                {/* Mini Progress Indicator */}
                {!m.unlocked ? (
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all"
                      style={{ width: `${m.progressPercent}%` }}
                    />
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-tight">
                    Unlocked
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Milestone Motivation Bar */}
        {nextMilestone && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">🎯</span>
              <div className="truncate">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Next: {nextMilestone.name}</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-400">
                  {bestStreak}/{nextMilestone.thresholdDays} days reached ({nextMilestone.thresholdDays - bestStreak} days to unlock)
                </p>
              </div>
            </div>
            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden shrink-0">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${nextMilestone.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Milestone Detail & Reward Celebration Modal */}
        {selectedMilestone && (
          <MilestoneModal
            milestone={selectedMilestone}
            onClose={() => setSelectedMilestone(null)}
          />
        )}
      </section>
    );
  }

  // Render on Profile / Full Showcase
  return (
    <div className="space-y-4" data-purpose="profile-milestones-showcase">
      {/* Overview Trophy Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-100 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Streak Trophy Hall
          </div>
          <h3 className="text-lg font-bold mt-0.5">
            {unlockedCount} of {milestones.length} Badges Earned
          </h3>
          <p className="text-xs text-amber-100/90 mt-1 font-medium">
            Active highest streak: <span className="font-bold text-white">{bestStreak} consecutive days</span>
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shrink-0">
          <Trophy className="w-7 h-7" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({milestones.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unlocked')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            filter === 'unlocked'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('locked')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            filter === 'locked'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          In Progress ({milestones.length - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredMilestones.map((m) => {
          const styles = getTierColors(m.tier, m.unlocked);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMilestone(m)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-95 group ${
                m.unlocked
                  ? `${styles.cardBg} shadow-xs hover:shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-xs group-hover:scale-105 transition-transform ${styles.badgeBg}`}
                >
                  {renderBadgeIcon(m.iconName, 'w-5 h-5')}
                </div>
                {m.unlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Earned
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> {m.thresholdDays}d
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                  {m.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100/80 w-full">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>{m.unlocked ? 'Milestone Complete' : 'Progress'}</span>
                  <span>{m.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.unlocked ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMilestone && (
        <MilestoneModal
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  );
}

// Interactive Milestone Detail & Celebration Modal
function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: Milestone;
  onClose: () => void;
}) {
  const isUnlocked = milestone.unlocked;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        data-purpose="milestone-detail-modal"
      >
        {/* Background ambient glow */}
        {isUnlocked && (
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close milestone details"
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Medallion Graphic */}
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="relative mb-3">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center border-4 shadow-xl transition-transform ${
                isUnlocked
                  ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-white border-yellow-200 shadow-amber-200/60 scale-105'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              {milestone.iconName === 'Flame' && <Flame className="w-10 h-10" />}
              {milestone.iconName === 'Zap' && <Zap className="w-10 h-10" />}
              {milestone.iconName === 'Award' && <Award className="w-10 h-10" />}
              {milestone.iconName === 'Trophy' && <Trophy className="w-10 h-10" />}
              {milestone.iconName === 'Crown' && <Crown className="w-10 h-10" />}
              {milestone.iconName === 'ShieldCheck' && <ShieldCheck className="w-10 h-10" />}
            </div>

            {isUnlocked ? (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-700 border-2 border-white flex items-center justify-center text-white shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1.5 ${
              isUnlocked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isUnlocked ? '🎉 Milestone Unlocked!' : 'Locked Challenge'}
          </span>

          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {milestone.name}
          </h3>
          <p className="text-xs font-semibold text-amber-600 mt-0.5">
            {milestone.rewardTitle}
          </p>

          <p className="text-xs text-slate-500 font-medium mt-2 px-2">
            {milestone.description}
          </p>

          {/* Stat Details Box */}
          <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-100 mt-4 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Requirement:</span>
              <span className="font-bold text-slate-800">{milestone.thresholdDays} Consecutive Days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Your Highest Streak:</span>
              <span className="font-bold text-slate-800">{milestone.progressDays} Days</span>
            </div>
            {milestone.bestHabitName && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Earned With:</span>
                <span className="font-semibold text-emerald-600 truncate max-w-[130px]">
                  {milestone.bestHabitName}
                </span>
              </div>
            )}
            <div className="pt-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span>Progress</span>
                <span>{milestone.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUnlocked ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${milestone.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-98 transition cursor-pointer"
          >
            {isUnlocked ? 'Awesome, Keep Going!' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
}
