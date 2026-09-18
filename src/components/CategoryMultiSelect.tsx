import React, { useState, useRef, useEffect } from 'react';
import { HabitCategory } from '../types';
import { CATEGORY_DEFINITIONS, CategoryDefinition } from '../utils/categoryData';
import { Check, ChevronDown, ChevronUp, X, Tag } from 'lucide-react';

interface CategoryMultiSelectProps {
  selectedCategories: HabitCategory[];
  onChange: (categories: HabitCategory[]) => void;
}

export default function CategoryMultiSelect({
  selectedCategories,
  onChange,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (catId: HabitCategory) => {
    if (selectedCategories.includes(catId)) {
      // If only 1 remains, keep at least 1 or allow empty (defaulting back)
      if (selectedCategories.length === 1) {
        // keep at least 1 or allow switching
        onChange([]);
      } else {
        onChange(selectedCategories.filter((c) => c !== catId));
      }
    } else {
      onChange([...selectedCategories, catId]);
    }
  };

  const removeCategory = (catId: HabitCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategories.filter((c) => c !== catId));
  };

  const filteredCategories = CATEGORY_DEFINITIONS.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    );
  });

  return (
    <div
      ref={dropdownRef}
      className="space-y-2 relative"
      data-purpose="category-multi-select"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="category-dropdown-trigger"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
        >
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          Habit Categories
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          {selectedCategories.length === 0
            ? 'None selected (tap below)'
            : `${selectedCategories.length} selected`}
        </span>
      </div>

      {/* Main Dropdown Field Trigger Button */}
      <button
        id="category-dropdown-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] bg-[#f8fafc] border rounded-2xl px-3 py-2 text-left flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
            : 'border-slate-200/90 hover:bg-slate-50'
        }`}
      >
        {/* Selected Chips inside trigger */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {selectedCategories.length === 0 ? (
            <span className="text-xs text-slate-400 font-medium px-1">
              Select or multi-select categories (e.g. Health, Fitness)...
            </span>
          ) : (
            selectedCategories.map((catId) => {
              const def =
                CATEGORY_DEFINITIONS.find((c) => c.id === catId) ||
                CATEGORY_DEFINITIONS[0];
              return (
                <span
                  key={catId}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border shadow-2xs ${def.tagClass}`}
                >
                  <span>{def.emoji}</span>
                  <span>{def.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeCategory(catId, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        removeCategory(catId, e as any);
                      }
                    }}
                    className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer ml-0.5"
                    title={`Remove ${def.label}`}
                    aria-label={`Remove ${def.label}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </span>
              );
            })
          )}
        </div>

        {/* Dropdown Chevron */}
        <div className="text-slate-400 shrink-0 pl-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
          )}
        </div>
      </button>

      {/* Quick Clickable Category Tags Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
          Quick add:
        </span>
        {CATEGORY_DEFINITIONS.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              id={`quick-cat-toggle-${cat.id.toLowerCase()}`}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? `${cat.activeColor} shadow-xs ring-1 ring-black/10`
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
              }`}
            >
              <span className="text-[11px]">{cat.emoji}</span>
              <span>{cat.label}</span>
              {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
            </button>
          );
        })}
      </div>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div
          id="category-dropdown-menu"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-40 space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Quick Search */}
          <div className="p-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter categories..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Rows */}
          <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 pr-0.5">
            {filteredCategories.map((cat: CategoryDefinition) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  id={`cat-option-${cat.id.toLowerCase()}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100/80 font-semibold text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base p-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                      {cat.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {cat.description}
                      </div>
                    </div>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-1.5 px-1 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() =>
                onChange(CATEGORY_DEFINITIONS.map((c) => c.id))
              }
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[10px] hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
