import React, { useState, useEffect, useRef } from 'react';
import { Clock, Globe, ChevronDown, Check } from 'lucide-react';
import { useTimezone, TIMEZONE_OPTIONS, TimezoneMode } from '../../context/TimezoneContext';

export const TimezoneClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { timezone, setTimezone, formatLiveTime } = useTimezone();
  const [liveTime, setLiveTime] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setLiveTime(formatLiveTime());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [formatLiveTime]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-surface border border-border-subtle text-text-main text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
        title="Click to change timezone (Default: IST)"
      >
        <Clock className="w-3.5 h-3.5 text-brand-teal shrink-0" />
        <span className="font-mono text-[11px] font-semibold tracking-tight">
          {liveTime || '00:00:00 IST'}
        </span>
        <ChevronDown className={`w-3 h-3 text-text-caption transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl border border-border-subtle shadow-modal py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-1.5 border-b border-border-subtle flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-teal" /> Active Timezone
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-brand-teal font-semibold border border-teal-200">
              Default: IST
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {(Object.keys(TIMEZONE_OPTIONS) as TimezoneMode[]).map(tzKey => {
              const info = TIMEZONE_OPTIONS[tzKey];
              const isSelected = timezone === tzKey;

              return (
                <button
                  key={tzKey}
                  onClick={() => {
                    setTimezone(tzKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand-teal/10 text-brand-teal font-bold'
                      : 'text-text-main hover:bg-surface-subtle font-medium'
                  }`}
                >
                  <div className="flex flex-col text-left min-w-0">
                    <span className="truncate">{info.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-teal shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
