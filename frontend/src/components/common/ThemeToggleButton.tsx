import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleButtonProps {
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none border focus:outline-hidden hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:border-amber-400/60 hover:bg-slate-800 shadow-md shadow-amber-500/10'
          : 'bg-white text-slate-700 hover:text-amber-500 border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 shadow-xs hover:shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to Day Theme' : 'Switch to Night Theme'}
      title={isDark ? 'Switch to Day Theme' : 'Switch to Night Theme (Deep Ocean)'}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <div className="relative flex items-center justify-center animate-in zoom-in-75 duration-300">
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300/20 transition-transform duration-300 rotate-0" />
            <Sparkles className="w-2 h-2 text-sky-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center animate-in zoom-in-75 duration-300">
            <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform duration-300" />
          </div>
        )}
      </div>

      {/* Subtle indicator ring on hover */}
      <span
        className={`absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 hover:opacity-100 pointer-events-none ${
          isDark ? 'ring-2 ring-amber-400/20' : 'ring-2 ring-amber-400/30'
        }`}
      />
    </button>
  );
};
