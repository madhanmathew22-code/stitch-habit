import { useState } from 'react';
import { Habit, MoodId, MOOD_OPTIONS, MoodOption } from '../types';
import { getMoodOption } from '../utils/moodHelpers';

interface MoodLogModalProps {
  habit: Habit;
  onSaveMood: (habitId: string, mood: MoodId, note?: string) => void;
  onRemoveMood?: (habitId: string) => void;
  onClose: () => void;
}

const QUICK_REFLECTION_TAGS = [
  'Refreshed & Clear',
  'Energized start',
  'Deep focus',
  'Pushed through resistance',
  'Peaceful moment',
];

export default function MoodLogModal({
  habit,
  onSaveMood,
  onRemoveMood,
  onClose,
}: MoodLogModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodId>(habit.todayMood || 'calm');
  const [note, setNote] = useState<string>(habit.todayMoodNote || '');

  const activeOption: MoodOption = getMoodOption(selectedMood) || MOOD_OPTIONS[2];

  const handleSave = () => {
    onSaveMood(habit.id, selectedMood, note.trim() || undefined);
    onClose();
  };

  const handleRemove = () => {
    if (onRemoveMood) {
      onRemoveMood(habit.id);
    }
    onClose();
  };

  return (
    <div
      id="mood-log-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-log-title"
    >
      <div
        className="w-full max-w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient tint matching selected mood */}
        <div className="relative p-5 pb-4 border-b border-slate-100 bg-linear-to-b from-slate-50 to-white">
          <button
            id="mood-log-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close Mood Log"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Mood Log
              </span>
              <h2 id="mood-log-title" className="text-base font-bold text-slate-900 mt-1">
                How did this habit feel?
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logging your emotional state for <span className="font-semibold text-slate-800">{habit.name}</span> builds self-awareness in analytics.
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* 5 Mindful Emoji Mood Cards */}
          <div className="space-y-1.5" role="radiogroup" aria-label="Select your mood">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Choose your feeling:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    id={`mood-option-${mood.id}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? `${mood.bgSoft} border-slate-300 ring-2 ${mood.ringColor} shadow-xs scale-[1.01]`
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs border border-slate-100">
                        {mood.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isSelected ? mood.color : 'text-slate-800'}`}>
                            {mood.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {mood.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Mood Highlight description pill */}
          <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${activeOption.badgeBg}`}>
            <span className="text-base">{activeOption.emoji}</span>
            <span className="font-medium text-slate-700">
              <strong className="font-semibold text-slate-900">{activeOption.label}:</strong> {activeOption.description}
            </span>
          </div>

          {/* Quick Reflection Note */}
          <div className="space-y-1.5">
            <label htmlFor="mood-reflection-input" className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Mindful Reflection (Optional):
            </label>
            <input
              id="mood-reflection-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Felt energized after morning focus..."
              maxLength={70}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 bg-slate-50/60"
            />

            {/* Quick tag chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {QUICK_REFLECTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNote(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                    note === tag
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              id="mood-log-save-btn"
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer text-center"
            >
              Save Mood Log
            </button>
            <button
              id="mood-log-skip-btn"
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-[0.98] text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Skip
            </button>
          </div>

          {habit.todayMood && onRemoveMood && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[10px] text-slate-400 hover:text-rose-500 transition text-center py-0.5 cursor-pointer"
            >
              Clear logged mood for today
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
