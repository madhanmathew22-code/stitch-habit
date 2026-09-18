import { useState, useMemo } from 'react';
import StatusBar from './StatusBar';
import HomeIndicator from './HomeIndicator';
import { Habit, HabitCategory, HabitIconKey, TargetFrequency, formatTargetFrequency } from '../types';
import {
  HABIT_ICONS_LIST,
  getHabitIconDefinition,
  IconCategoryFilter,
  HabitIconDefinition,
} from './habitIconsData';
import HabitIconDisplay from './HabitIconDisplay';
import CategoryMultiSelect from './CategoryMultiSelect';
import TargetFrequencySelector from './TargetFrequencySelector';
import GoalRecommendationEngine from './GoalRecommendationEngine';
import { GoalRecommendation } from '../utils/goalRecommendations';
import {
  Check,
  Search,
  X,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AddHabitScreenProps {
  onSaveHabit: (habit: Habit) => void;
  onNavigateHome: () => void;
}

export default function AddHabitScreen({ onSaveHabit, onNavigateHome }: AddHabitScreenProps) {
  const [habitName, setHabitName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<HabitCategory[]>(['Health']);
  const [selectedIcon, setSelectedIcon] = useState<HabitIconKey>('water');
  const [iconCategoryFilter, setIconCategoryFilter] = useState<IconCategoryFilter>('All');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [targetFrequency, setTargetFrequency] = useState<TargetFrequency>({
    mode: 'times_per_week',
    timesPerPeriod: 3,
    period: 'week',
    daysOfWeek: [1, 3, 5],
    label: '3 times a week',
  });
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00 AM');

  const selectedIconDef = useMemo(() => {
    return getHabitIconDefinition(selectedIcon);
  }, [selectedIcon]);

  // Filtered icons based on category and search query
  const filteredIcons = useMemo(() => {
    return HABIT_ICONS_LIST.filter((item: HabitIconDefinition) => {
      const matchesCategory =
        iconCategoryFilter === 'All' || item.category === iconCategoryFilter;
      const query = iconSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [iconCategoryFilter, iconSearchQuery]);

  const handleSave = () => {
    const finalName = habitName.trim() || 'Hydrate & Energize';
    const primaryCat = selectedCategories[0] || 'Health';
    const frequencyLabel = formatTargetFrequency(targetFrequency);
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      name: finalName,
      subtitle: frequencyLabel,
      timeOfDay: 'morning',
      icon: selectedIcon,
      completed: false,
      frequency: targetFrequency.mode === 'everyday' ? 'Daily' : 'Weekly',
      targetFrequency,
      category: primaryCat,
      categories: selectedCategories.length > 0 ? selectedCategories : [primaryCat],
      reminderTime,
      reminderEnabled,
      completionHistory: [],
      createdAt: Date.now(),
    };
    onSaveHabit(newHabit);
  };

  const handleApplyRecommendation = (rec: GoalRecommendation) => {
    setHabitName(rec.name);
    setSelectedIcon(rec.icon);
    setTargetFrequency(rec.targetFrequency);
    setReminderTime(rec.reminderTime);
    setReminderEnabled(true);
    if (!selectedCategories.includes(rec.category)) {
      setSelectedCategories([rec.category, ...selectedCategories]);
    }
  };

  return (
    <div className="w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col justify-between relative overflow-hidden select-none transition-colors">
      <StatusBar />

      {/* MainContent */}
      <main className="flex-1 overflow-y-auto px-5 pt-2 pb-6 flex flex-col justify-between no-scrollbar" data-purpose="add-habit-modal">
        <div>
          {/* ModalHeader */}
          <header className="relative flex items-center justify-center py-2 mb-4" data-purpose="header">
            {/* Close button */}
            <button
              id="close-add-habit-modal-btn"
              aria-label="Close"
              onClick={onNavigateHome}
              className="absolute left-0 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              type="button"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Modal Title */}
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">Create a New Habit</h1>
          </header>

          {/* Live Habit Card Preview */}
          <div className="mb-5 p-3 rounded-2xl bg-linear-to-r from-slate-50 via-slate-50/80 to-slate-100/60 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-850/80 border border-slate-200/70 dark:border-slate-700 shadow-2xs" data-purpose="live-habit-preview">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Live Card Preview
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
                    No category
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                  🎯 {formatTargetFrequency(targetFrequency)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <HabitIconDisplay iconId={selectedIcon} size="md" />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {habitName.trim() || 'Your Habit Title'}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                    Target: {formatTargetFrequency(targetFrequency)} • {reminderEnabled ? reminderTime : 'No reminder'}
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-600 shrink-0 flex items-center justify-center"></div>
            </div>
          </div>

          {/* FormFields */}
          <form className="space-y-4" data-purpose="habit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Field 1: Habit Name */}
            <div data-purpose="input-habit-name">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="habit-name">
                Habit Name
              </label>
              <input
                id="habit-name"
                name="habitName"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. 5km Running, Workout, Deep Reading..."
                className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none transition-all shadow-2xs font-medium"
                type="text"
              />
            </div>

            {/* Field: Category Multi-Select & Dropdown */}
            <div data-purpose="category-selection">
              <CategoryMultiSelect
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>

            {/* Goal Recommendation Engine based on Selected Category */}
            <GoalRecommendationEngine
              selectedCategories={selectedCategories}
              currentHabitName={habitName}
              onApplyRecommendation={handleApplyRecommendation}
            />

            {/* Field 2: Selectable Custom Habit Icon */}
            <div data-purpose="icon-selection" className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Custom Icon ({HABIT_ICONS_LIST.length} symbols)
                </label>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Selected: <strong className="text-slate-900 dark:text-white font-bold">{selectedIconDef.label}</strong> {selectedIconDef.emoji}
                </span>
              </div>

              {/* Selected Icon Spotlight Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <HabitIconDisplay iconId={selectedIcon} size="lg" variant="solid" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {selectedIconDef.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold">
                        {selectedIconDef.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {selectedIconDef.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg shrink-0 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Active
                </div>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {(['All', 'Health', 'Fitness', 'Mindfulness', 'Lifestyle'] as IconCategoryFilter[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setIconCategoryFilter(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        iconCategoryFilter === tab
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Quick Icon Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    placeholder="Search icons (e.g., water, gym, book, coffee, sleep)..."
                    className="w-full bg-[#f8fafc] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                  {iconSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIconSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Icons Grid */}
              <div
                id="habit-icon-picker-grid"
                className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-2 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl no-scrollbar"
              >
                {filteredIcons.length === 0 ? (
                  <div className="col-span-4 sm:col-span-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No custom icons found matching "{iconSearchQuery}".
                  </div>
                ) : (
                  filteredIcons.map((item) => {
                    const isSelected = selectedIcon === item.id;
                    const IconComp = item.Icon;
                    return (
                      <button
                        key={item.id}
                        id={`icon-select-${item.id}`}
                        aria-label={`Select ${item.label} icon`}
                        title={`${item.label} - ${item.description}`}
                        type="button"
                        onClick={() => setSelectedIcon(item.id)}
                        className={`group relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? `${item.activeBg} text-white shadow-md ring-2 ${item.ringColor} ring-offset-2 scale-[1.03]`
                            : `${item.bgColor} ${item.textColor} hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs border border-transparent hover:border-slate-200 dark:hover:border-slate-600`
                        }`}
                      >
                        <IconComp className="w-5 h-5 stroke-[2.2] shrink-0" />
                        <span
                          className={`text-[9px] mt-1 font-semibold truncate max-w-full leading-none transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>

                        {/* Selected Check Badge */}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Field 3: Target Frequency (e.g., 3 times a week) */}
            <div data-purpose="frequency-selector" className="pt-1">
              <TargetFrequencySelector
                value={targetFrequency}
                onChange={setTargetFrequency}
              />
            </div>

            {/* Field 4: Set Reminder */}
            <div className="space-y-2.5" data-purpose="reminder-settings">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300" htmlFor="reminder-toggle">
                  Daily Reminder
                </label>
                {/* iOS Style Switch */}
                <button
                  id="reminder-toggle"
                  type="button"
                  role="switch"
                  aria-checked={reminderEnabled}
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    reminderEnabled ? 'bg-[#22C55E]' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                      reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Time Picker Row Button */}
              {reminderEnabled && (
                <div
                  onClick={() => {
                    const times = ['07:00 AM', '08:00 AM', '09:00 AM', '12:00 PM', '06:00 PM', '09:00 PM'];
                    const currentIdx = times.indexOf(reminderTime);
                    const nextTime = times[(currentIdx + 1) % times.length];
                    setReminderTime(nextTime);
                  }}
                  className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-500 stroke-[2.2]" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{reminderTime}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>

            {/* QuoteCard */}
            <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center" data-purpose="inspirational-quote">
              <p className="text-xs italic font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                “A little progress each day adds up to big results.”
              </p>
            </div>
          </form>
        </div>

        {/* ActionButton */}
        <div className="pt-3 pb-1" data-purpose="bottom-actions">
          <button
            id="add-habit-save-btn"
            onClick={handleSave}
            className="w-full py-3.5 px-6 rounded-full bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-green-500/25 transition-all text-center tracking-wide cursor-pointer flex items-center justify-center gap-2"
            type="button"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Save Habit
          </button>
        </div>
      </main>

      <HomeIndicator />
    </div>
  );
}

