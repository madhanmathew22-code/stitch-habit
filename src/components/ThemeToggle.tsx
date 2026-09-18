import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'expanded';
  className?: string;
}

export default function ThemeToggle({
  variant = 'icon',
  className = '',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        id="theme-toggle-pill-btn"
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-13 items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          isDark ? 'bg-slate-700' : 'bg-slate-200'
        } ${className}`}
      >
        <span
          className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            isDark
              ? 'translate-x-6 bg-slate-900 text-amber-300'
              : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 stroke-[2.2]" />
          ) : (
            <Sun className="w-3.5 h-3.5 stroke-[2.2]" />
          )}
        </span>
      </button>
    );
  }

  if (variant === 'expanded') {
    return (
      <div
        id="theme-toggle-expanded"
        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/80 text-slate-200'
            : 'bg-white border-slate-200/80 text-slate-800'
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/60'
                : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}
          >
            {isDark ? (
              <Moon className="w-4.5 h-4.5 stroke-[2.2]" />
            ) : (
              <Sun className="w-4.5 h-4.5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">
              {isDark ? 'Deep Evening Dark' : 'Mindful Light'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              {isDark
                ? 'Gentle obsidian tones for evening focus'
                : 'Clean, radiant palette for daytime clarity'}
            </div>
          </div>
        </div>

        <button
          id="theme-toggle-expanded-btn"
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
            isDark ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  // Default 'icon' variant for header
  return (
    <button
      id="theme-toggle-header-btn"
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={
        isDark
          ? 'Switch to Mindful Light theme'
          : 'Switch to Deep Evening Dark theme'
      }
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs border active:scale-95 ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
    >
      {isDark ? (
        <Moon className="w-4 h-4 stroke-[2.2] animate-in spin-in-180 duration-200" />
      ) : (
        <Sun className="w-4 h-4 stroke-[2.2] animate-in spin-in-180 duration-200 text-amber-500" />
      )}
    </button>
  );
}
