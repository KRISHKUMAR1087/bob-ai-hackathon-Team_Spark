import React, { createContext, useContext, useState } from 'react';

export type TimezoneMode = 'IST' | 'UTC' | 'SGT' | 'EST';

export interface TimezoneInfo {
  code: TimezoneMode;
  label: string;
  shortLabel: string;
  offsetMinutes: number;
}

export const TIMEZONE_OPTIONS: Record<TimezoneMode, TimezoneInfo> = {
  IST: { code: 'IST', label: 'Indian Standard Time (IST, UTC+5:30)', shortLabel: 'IST (+5:30)', offsetMinutes: 330 },
  UTC: { code: 'UTC', label: 'Coordinated Universal Time (UTC)', shortLabel: 'UTC (+0:00)', offsetMinutes: 0 },
  SGT: { code: 'SGT', label: 'Singapore Time (SGT, UTC+8:00)', shortLabel: 'SGT (+8:00)', offsetMinutes: 480 },
  EST: { code: 'EST', label: 'Eastern Standard Time (EST, UTC-5:00)', shortLabel: 'EST (-5:00)', offsetMinutes: -300 },
};

interface TimezoneContextType {
  timezone: TimezoneMode;
  setTimezone: (tz: TimezoneMode) => void;
  timezoneInfo: TimezoneInfo;
  formatLiveTime: (date?: Date) => string;
  formatTimeString: (timeStr: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

const STORAGE_KEY = 'portspilot_timezone';

export function convertUtcStringToTimezone(str: string, targetTz: TimezoneMode): string {
  if (!str) return str;
  if (targetTz === 'UTC') return str;

  const targetInfo = TIMEZONE_OPTIONS[targetTz] || TIMEZONE_OPTIONS.IST;
  const offsetMins = targetInfo.offsetMinutes;

  return str.replace(/(\d{1,2}):(\d{2})(\s*UTC)?/gi, (_, hStr, mStr) => {
    const hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);

    let totalMins = hours * 60 + minutes + offsetMins;
    totalMins = (totalMins % 1440 + 1440) % 1440;

    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(newH)}:${pad(newM)} ${targetInfo.code}`;
  });
}

export function formatLiveClock(date: Date, targetTz: TimezoneMode): string {
  const targetInfo = TIMEZONE_OPTIONS[targetTz] || TIMEZONE_OPTIONS.IST;
  const offsetMins = targetInfo.offsetMinutes;

  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const tzDate = new Date(utcMs + offsetMins * 60000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = pad(tzDate.getHours());
  const m = pad(tzDate.getMinutes());
  const s = pad(tzDate.getSeconds());

  return `${h}:${m}:${s} ${targetInfo.code}`;
}

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezoneState] = useState<TimezoneMode>(() => {
    if (typeof window === 'undefined') return 'IST';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in TIMEZONE_OPTIONS) {
      return saved as TimezoneMode;
    }
    return 'IST'; // Default to Indian Standard Time
  });

  const setTimezone = (tz: TimezoneMode) => {
    setTimezoneState(tz);
    localStorage.setItem(STORAGE_KEY, tz);
  };

  const timezoneInfo = TIMEZONE_OPTIONS[timezone] || TIMEZONE_OPTIONS.IST;

  const formatLiveTime = (date: Date = new Date()): string => {
    return formatLiveClock(date, timezone);
  };

  const formatTimeString = (timeStr: string): string => {
    return convertUtcStringToTimezone(timeStr, timezone);
  };

  return (
    <TimezoneContext.Provider
      value={{
        timezone,
        setTimezone,
        timezoneInfo,
        formatLiveTime,
        formatTimeString,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = (): TimezoneContextType => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};
