'use client';

import type { HomeSettings } from '@soouls/api/router';
import { useEffect } from 'react';

export const HOME_THEME_STORAGE_KEY = 'soouls-home-theme';

export const HOME_DEFAULT_SETTINGS: HomeSettings = {
  themeMode: 'dark',
  accentTheme: 'orange',
  defaultView: 'canvas',
  writingMode: 'minimal',
  insightDepth: 'balanced',
  autoClustering: true,
  suggestions: true,
  autosave: true,
  focusMode: false,
  sessionTracking: true,
  dataStorage: 'local',
  dataUsage: 'anonymous',
  dailyReminder: false,
  reflectionPrompts: false,
  reminderTime: '20:00',
};

export function applyHomeTheme(
  input?: Partial<Pick<HomeSettings, 'themeMode' | 'accentTheme'>> | null,
) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.themeMode = input?.themeMode ?? HOME_DEFAULT_SETTINGS.themeMode;
  root.dataset.accentTheme = input?.accentTheme ?? HOME_DEFAULT_SETTINGS.accentTheme;
}

export function useApplyHomeTheme(
  input?: Partial<Pick<HomeSettings, 'themeMode' | 'accentTheme'>> | null,
) {
  useEffect(() => {
    applyHomeTheme(input);
  }, [input?.themeMode, input?.accentTheme]);
}

export function formatReminderTime(value: string): string {
  const [rawHour = '20', rawMinute = '00'] = value.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return '8:00 PM';
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function titleCase(value: string): string {
  return value.replace(/(^\w|-\w)/g, (match) => match.replace('-', ' ').toUpperCase());
}
