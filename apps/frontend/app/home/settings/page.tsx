'use client';

import { Bell, ChevronDown, Clock, Moon, Sparkles, User } from 'lucide-react';
import type { HomeSettings } from '@soouls/api/router';
import { UserButton } from '@clerk/nextjs';
import { Bell, ChevronDown, Clock, Loader2, Moon, Sparkles, Sun } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HOME_DEFAULT_SETTINGS,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
  formatReminderTime,
} from '../../../src/hooks/use-home-theme';
import { clearQueryCache } from '../../../src/providers/trpc-provider';
import { trpc } from '../../../src/utils/trpc';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { useUser } from '@clerk/nextjs';

const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        backgroundColor: on
          ? 'rgba(var(--soouls-accent-rgb), 0.92)'
          : 'var(--soouls-overlay-muted)',
      }}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SectionCard({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{
        backgroundColor: 'var(--soouls-bg-surface)',
        borderColor: 'var(--soouls-border)',
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-urbanist font-semibold text-base mb-5 text-[var(--soouls-text-strong)]">{children}</h2>;
}

function SettingRow({
  label,
  right,
  sublabel,
  icon,
}: {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
    >
      <div className="flex items-center gap-3">
        {icon && <span style={{ color: 'var(--soouls-accent)' }}>{icon}</span>}
        <div>
          <p className="font-urbanist font-medium text-sm text-[var(--soouls-text-strong)]">{label}</p>
          {sublabel && <p className="font-urbanist text-xs mt-0.5 text-[var(--soouls-text-faint)]">{sublabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const [prefs, setPrefs] = useState<AppPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [notifDailyReminder, setNotifDailyReminder] = useState(false);
  const [notifReflectionPrompts, setNotifReflectionPrompts] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('soouls_settings');
      if (raw) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      }
    } catch {}
    setPrefsLoaded(true);
  const utils = trpc.useUtils();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const confirmedSettingsRef = useRef<HomeSettings>(HOME_DEFAULT_SETTINGS);
  const queuedSettingsRef = useRef<HomeSettings | null>(null);
  const isFlushingRef = useRef(false);
  const hasOptimisticSettingsRef = useRef(false);
  const [feedback, setFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const { data } = trpc.private.home.getSettings.useQuery(undefined);
  const settings = useMemo(() => data ?? HOME_DEFAULT_SETTINGS, [data]);
  const updateSettings = trpc.private.home.updateSettings.useMutation();

  const persistThemeSelection = useCallback((next: HomeSettings) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      HOME_THEME_STORAGE_KEY,
      JSON.stringify({
        themeMode: next.themeMode,
        accentTheme: next.accentTheme,
      }),
    );
  }, []);

  const applySettingsLocally = useCallback(
    (next: HomeSettings) => {
      utils.private.home.getSettings.setData(undefined, next);
      applyHomeTheme(next);
      persistThemeSelection(next);
    },
    [persistThemeSelection, utils],
  );

  useEffect(() => {
    if (!data || hasOptimisticSettingsRef.current) return;
    confirmedSettingsRef.current = data;
  }, [data]);

  useEffect(() => {
    if (feedback !== 'saved') return;
    const timer = setTimeout(() => setFeedback('idle'), 1800);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!cacheMessage) return;
    const timer = setTimeout(() => setCacheMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [cacheMessage]);

  const flushQueuedSettings = useCallback(async () => {
    if (isFlushingRef.current) return;
    isFlushingRef.current = true;

    try {
      while (queuedSettingsRef.current) {
        const payload = queuedSettingsRef.current;
        queuedSettingsRef.current = null;

        const saved = await updateSettings.mutateAsync(payload);
        confirmedSettingsRef.current = saved;

        if (!queuedSettingsRef.current) {
          hasOptimisticSettingsRef.current = false;
          applySettingsLocally(saved);
          await Promise.all([
            utils.private.home.getInsights.invalidate(),
            utils.private.home.getAccount.invalidate(),
            utils.private.home.getClusters.invalidate(),
          ]);
          setFeedback('saved');
        }
      }
    } catch (_error) {
      hasOptimisticSettingsRef.current = false;
      queuedSettingsRef.current = null;
      applySettingsLocally(confirmedSettingsRef.current);
      setFeedback('idle');
    } finally {
      isFlushingRef.current = false;

      if (queuedSettingsRef.current) {
        void flushQueuedSettings();
      }
    }
  }, [applySettingsLocally, updateSettings, utils]);

  const handlePatch = useCallback(
    (patch: Partial<HomeSettings>) => {
      const previous =
        queuedSettingsRef.current ??
        utils.private.home.getSettings.getData(undefined) ??
        confirmedSettingsRef.current;
      const next = { ...previous, ...patch };

      hasOptimisticSettingsRef.current = true;
      queuedSettingsRef.current = next;
      setFeedback('saving');
      applySettingsLocally(next);
      void flushQueuedSettings();
    },
    [applySettingsLocally, flushQueuedSettings, utils],
  );

  const handleResetApp = useCallback(() => {
    handlePatch(HOME_DEFAULT_SETTINGS);
  }, [handlePatch]);

  const handleClearCache = useCallback(async () => {
    await clearQueryCache();

    if (typeof window !== 'undefined') {
      const keys = Object.keys(window.localStorage);
      for (const key of keys) {
        if (key.startsWith('soouls_entry_v1_')) {
          window.localStorage.removeItem(key);
        }
      }
    }

    await Promise.all([
      utils.private.entries.getAll.invalidate(),
      utils.private.entries.getGalaxy.invalidate(),
      utils.private.home.getInsights.invalidate(),
      utils.private.home.getAccount.invalidate(),
      utils.private.home.getClusters.invalidate(),
    ]);
    setCacheMessage('Cache cleared');
  }, [utils]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--soouls-bg)',
        color: 'var(--soouls-text-strong)',
        fontFamily: FONT_URBANIST,
      }}
    >
      <header
        className="px-8 py-6 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--soouls-border)' }}
      >
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-2 transition-colors text-[var(--soouls-text-muted)] hover:text-[var(--soouls-text-strong)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <span className="text-[var(--soouls-text-faint)]">/</span>
          <span className="text-lg" style={{ color: 'var(--soouls-accent)' }}>
            Settings
          </span>
        </div>

      <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: FONT_URBANIST }}>
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#e07a5f] text-lg">Settings</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-9 h-9 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all overflow-hidden"
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white/60 mx-auto" />
            )}
          </button>
        </header>
        <div className="flex items-center gap-3">
          {feedback === 'saving' && (
            <div className="flex items-center gap-2 text-xs text-[var(--soouls-text-faint)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving
            </div>
          )}
          {feedback === 'saved' && <div className="text-xs" style={{ color: 'var(--soouls-accent)' }}>Saved</div>}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-white/20 transition-all',
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-6 pb-16">
        <div>
          <h1 className="font-playfair text-4xl italic leading-tight text-[var(--soouls-text-strong)]">Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--soouls-accent)' }}>
            Control how Soouls works for you.
          </p>
        </div>

        <SectionCard>
          <p className="text-xs uppercase tracking-widest mb-4 text-[var(--soouls-text-faint)]">Preferences</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
            <div
              className="sm:pr-6 pb-4 sm:pb-0 border-b sm:border-b-0"
              style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
            >
              <p className="text-xs mb-3 text-[var(--soouls-text-faint)]">Theme</p>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({
                      themeMode: settings.themeMode === 'dark' ? 'light' : 'dark',
                    })
                  }
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.themeMode === 'dark' ? 'Dark' : 'Light'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePatch({
                      themeMode: settings.themeMode === 'dark' ? 'light' : 'dark',
                    })
                  }
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  {settings.themeMode === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div
              className="sm:px-6 pb-4 sm:pb-0 border-b sm:border-b-0"
              style={{
                borderColor: 'var(--soouls-overlay-subtle)',
                boxShadow: 'inset 1px 0 0 var(--soouls-overlay-subtle)',
              }}
            >
              <p className="text-xs mb-3 text-[var(--soouls-text-faint)]">Default view</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold" style={{ color: 'var(--soouls-accent)' }}>
                  {settings.defaultView.charAt(0).toUpperCase() + settings.defaultView.slice(1)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const views: HomeSettings['defaultView'][] = ['canvas', 'list', 'calendar'];
                    const index = views.indexOf(settings.defaultView);
                    handlePatch({ defaultView: views[(index + 1) % views.length] ?? 'canvas' });
                  }}
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="sm:pl-6">
              <p className="text-xs mb-3 text-[var(--soouls-text-faint)]">Writing Mode</p>
              <div className="flex items-center gap-2">
                {(['minimal', 'guided'] as const).map((mode, index) => (
                  <div key={mode} className="flex items-center gap-2">
                    {index > 0 && <span style={{ color: 'var(--soouls-chip-divider)' }}>/</span>}
                    <button
                      type="button"
                      onClick={() => handlePatch({ writingMode: mode })}
                      className="text-sm font-medium transition-colors"
                      style={{
                        color: settings.writingMode === mode ? 'var(--soouls-accent)' : 'var(--soouls-text-faint)',
                      }}
                    >
                      {mode === 'minimal' ? 'Minimal' : 'Guided'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Notifications</SectionTitle>

          <SettingRow
            label="Daily reminder"
            sublabel="Gentle nudge to reflect on your day"
            icon={<Bell className="w-4 h-4" />}
            right={<Toggle on={settings.dailyReminder} onChange={(value) => handlePatch({ dailyReminder: value })} />}
          />

          <SettingRow
            label="Reflection prompts"
            sublabel="AI-generated questions for deeper thought"
            icon={<Sparkles className="w-4 h-4" />}
            right={
              <Toggle
                on={settings.reflectionPrompts}
                onChange={(value) => handlePatch({ reflectionPrompts: value })}
              />
            }
          />

          <SettingRow
            label="Time selector"
            sublabel="When should we reach out?"
            icon={<Clock className="w-4 h-4" />}
            right={
              <>
                <input
                  ref={timeInputRef}
                  type="time"
                  value={settings.reminderTime}
                  onChange={(event) => handlePatch({ reminderTime: event.target.value })}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = timeInputRef.current;
                    if (!input) return;
                    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
                    if (pickerInput.showPicker) {
                      pickerInput.showPicker();
                      return;
                    }
                    input.click();
                  }}
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    color: 'var(--soouls-accent)',
                    backgroundColor: 'var(--soouls-overlay-subtle)',
                    borderColor: 'var(--soouls-border)',
                  }}
                >
                  {formatReminderTime(settings.reminderTime)}
                </button>
              </>
            }
          />
        </SectionCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SectionCard>
            <SectionTitle>AI Behavior</SectionTitle>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest mb-3 text-[var(--soouls-text-faint)]">Insight depth</p>
              <div
                className="flex items-center rounded-xl p-1 gap-1"
                style={{ backgroundColor: 'var(--soouls-overlay-subtle)' }}
              >
                {(['minimal', 'balanced', 'deep'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handlePatch({ insightDepth: level })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      backgroundColor:
                        settings.insightDepth === level ? 'rgba(var(--soouls-accent-rgb), 0.95)' : 'transparent',
                      color: settings.insightDepth === level ? '#ffffff' : 'var(--soouls-text-faint)',
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <SettingRow
              label="Auto clustering"
              right={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: settings.autoClustering ? 'var(--soouls-accent)' : 'var(--soouls-text-faint)' }}>
                    {settings.autoClustering ? 'ON' : 'OFF'}
                  </span>
                  <Toggle on={settings.autoClustering} onChange={(value) => handlePatch({ autoClustering: value })} />
                </div>
              }
            />

            <SettingRow
              label="Suggestions"
              right={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: settings.suggestions ? 'var(--soouls-accent)' : 'var(--soouls-text-faint)' }}>
                    {settings.suggestions ? 'ON' : 'OFF'}
                  </span>
                  <Toggle on={settings.suggestions} onChange={(value) => handlePatch({ suggestions: value })} />
                </div>
              }
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle>App Behavior</SectionTitle>

            {([
              ['autosave', 'Autosave'],
              ['focusMode', 'Focus mode'],
              ['sessionTracking', 'Session tracking'],
            ] as const).map(([key, label]) => (
              <SettingRow
                key={key}
                label={label}
                right={
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: settings[key] ? 'var(--soouls-accent)' : 'var(--soouls-text-faint)',
                      }}
                    >
                      {settings[key] ? 'ON' : 'OFF'}
                    </span>
                    <Toggle on={settings[key]} onChange={(value) => handlePatch({ [key]: value })} />
                  </div>
                }
              />
            ))}
          </SectionCard>
        </div>

        <SectionCard>
          <SectionTitle>Privacy Controls</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0">
            <div
              className="sm:pr-6 pb-4 sm:pb-0 border-b sm:border-b-0"
              style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-3 text-[var(--soouls-text-faint)]">Data storage</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[var(--soouls-text-strong)]">
                  {settings.dataStorage === 'local' ? 'Local Only' : 'Cloud'}
                </span>
                <button
                  type="button"
                  onClick={() => handlePatch({ dataStorage: settings.dataStorage === 'local' ? 'cloud' : 'local' })}
                  className="text-xs underline underline-offset-2 transition-colors"
                  style={{ color: 'var(--soouls-accent)' }}
                >
                  Switch
                </button>
              </div>
            </div>

            <div
              className="sm:px-6 pb-4 sm:pb-0 border-b sm:border-b-0"
              style={{
                borderColor: 'var(--soouls-overlay-subtle)',
                boxShadow: 'inset 1px 0 0 var(--soouls-overlay-subtle)',
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-3 text-[var(--soouls-text-faint)]">Data usage</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[var(--soouls-text-strong)]">
                  {settings.dataUsage === 'anonymous' ? 'Anonymous' : 'Full'}
                </span>
                <button
                  type="button"
                  onClick={() => handlePatch({ dataUsage: settings.dataUsage === 'anonymous' ? 'full' : 'anonymous' })}
                  className="w-6 h-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: 'var(--soouls-accent)' }}
                  aria-label="Toggle data usage"
                />
              </div>
            </div>

            <div className="sm:pl-6">
              <p className="text-xs uppercase tracking-widest mb-3 text-[var(--soouls-text-faint)]">Clear history</p>
              <button
                type="button"
                onClick={handleClearCache}
                className="text-sm transition-colors"
                style={{ color: cacheMessage ? 'var(--soouls-accent)' : 'var(--soouls-text-faint)' }}
              >
                {cacheMessage ?? 'Clear all cached data →'}
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetApp}
            className="px-8 py-3 rounded-full border text-sm font-medium transition-all duration-200"
            style={{
              borderColor: 'var(--soouls-chip-divider)',
              color: 'var(--soouls-text-strong)',
            }}
          >
            Reset App
          </button>
          <button
            type="button"
            onClick={handleClearCache}
            className="px-8 py-3 rounded-full border text-sm font-medium transition-all duration-200"
            style={{
              borderColor: 'rgba(var(--soouls-accent-rgb), 0.4)',
              color: 'var(--soouls-accent)',
            }}
          >
            Clear Cache
          </button>
        </div>
      </main>
    </div>
  );
}
