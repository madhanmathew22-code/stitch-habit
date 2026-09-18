import React, { useState, useRef, useEffect } from 'react';
import { HabitSortOption } from '../types';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Flame,
  RotateCw,
} from 'lucide-react';

interface HabitSortDropdownProps {
  currentSort: HabitSortOption;
  onSortChange: (sort: HabitSortOption) => void;
}

interface SortOptionConfig {
  id: HabitSortOption;
  label: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  {
    id: 'Most Frequent',
    label: 'Most Frequent',
    badge: 'Frequency',
    description: 'Prioritizes daily & most repeated habits',
    icon: RotateCw,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'Highest Streak',
    label: 'Highest Streak',
    badge: 'Streaks',
    description: 'Ranks by longest consecutive unbroken days',
    icon: Flame,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'Recent',
    label: 'Recent',
    badge: 'Created',
    description: 'Newest and most recently added routines first',
    icon: Clock,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
];

export default function HabitSortDropdown({
  currentSort,
  onSortChange,
}: HabitSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const activeOption =
    SORT_OPTIONS.find((opt) => opt.id === currentSort) || SORT_OPTIONS[0];

  const handleSelect = (optionId: HabitSortOption) => {
    onSortChange(optionId);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      id="habit-sort-dropdown"
      className="relative inline-block text-left"
      data-purpose="habit-sorting-control"
    >
      {/* Dropdown Trigger Button */}
      <button
        id="habit-sort-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.2]" />
        <span className="text-slate-400 font-normal">Sort:</span>
        <span className="text-slate-900 font-bold">{activeOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          id="habit-sort-menu"
          role="listbox"
          aria-label="Habit sorting options"
          className="absolute right-0 top-full mt-1.5 w-60 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reorder Habits
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              3 sort orders
            </span>
          </div>

          <div className="space-y-0.5">
            {SORT_OPTIONS.map((option) => {
              const isSelected = currentSort === option.id;
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  id={`sort-opt-${option.id.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100/90 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${option.iconBg} ${option.iconColor} border border-black/5`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                        <span>{option.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                        {option.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
