'use client';

import { useUser } from '@clerk/nextjs';
import type { HomeSettings } from '@soouls/api/router';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Clock,
  Loader2,
  Moon,
  Palette,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HOME_DEFAULT_SETTINGS,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
  formatReminderTime,
} from '../../../src/hooks/use-home-theme';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { clearQueryCache } from '../../../src/providers/trpc-provider';
import { trpc } from '../../../src/utils/trpc';
import { BackgroundText } from '../../components/BackgroundText';

const FONT_URBANIST = 'var(--font-urbanist), system-ui, sans-serif';

const ACCENT_OPTIONS: { value: HomeSettings['accentTheme']; label: string; hex: string }[] = [
  { value: 'ember', label: 'Ember', hex: '#F06F4F' },
  { value: 'gold', label: 'Gold', hex: '#D8A23F' },
  { value: 'sage', label: 'Sage', hex: '#74AD86' },
  { value: 'violet', label: 'Violet', hex: '#8D79D6' },
];

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full p-[3px] transition-colors duration-300 ${
        on ? 'justify-end' : 'justify-start'
      }`}
      style={{
        backgroundColor: on ? 'rgba(var(--soouls-accent-rgb),0.92)' : 'var(--soouls-overlay-muted)',
      }}
      aria-checked={on}
      role="switch"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="h-4 w-4 rounded-full bg-white shadow-sm"
        whileTap={{ width: 22 }}
      />
    </button>
  );
}

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      className="rounded-[24px] border p-6"
      style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-base font-semibold text-[var(--soouls-text-strong)]">{children}</h2>
  );
}

function SettingRow({
  label,
  sublabel,
  icon,
  right,
}: { label: string; sublabel?: string; icon?: React.ReactNode; right: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
      style={{ borderColor: 'var(--soouls-overlay-subtle)' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="shrink-0" style={{ color: 'var(--soouls-accent)' }}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--soouls-text-strong)]">{label}</p>
          {sublabel ? (
            <p className="mt-0.5 text-xs text-[var(--soouls-text-faint)]">{sublabel}</p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
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
      JSON.stringify({ themeMode: next.themeMode, accentTheme: next.accentTheme }),
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
    } catch {
      hasOptimisticSettingsRef.current = false;
      queuedSettingsRef.current = null;
      applySettingsLocally(confirmedSettingsRef.current);
      setFeedback('idle');
    } finally {
      isFlushingRef.current = false;
      if (queuedSettingsRef.current) void flushQueuedSettings();
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

  const handleClearCache = useCallback(async () => {
    await clearQueryCache();
    if (typeof window !== 'undefined') {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith('soouls_entry_v1_')) window.localStorage.removeItem(key);
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
      className="soouls-page flex flex-col relative overflow-hidden select-none transition-colors duration-300"
      style={{
        backgroundColor: 'var(--soouls-bg)',
        color: 'var(--soouls-text)',
        fontFamily: FONT_URBANIST,
      }}
    >
      <BackgroundText />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-5 md:p-10 transition-all duration-300">
        <div className="flex items-center gap-1 text-[16px] sm:text-[22px] font-medium tracking-tight min-w-0">
          <Link href="/home" className="text-white/30 hover:text-white/60 transition-all">
            Home
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-[var(--soouls-accent)] truncate">Settings</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {feedback === 'saving' ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              style={{ color: 'var(--soouls-text-faint)' }}
            />
          ) : null}
          {feedback === 'saved' ? (
            <span className="text-xs" style={{ color: 'var(--soouls-accent)' }}>
              Saved
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 transition-all cursor-pointer overflow-hidden shadow-2xl"
          >
            <img
              src={user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id)}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-12 relative z-10 flex flex-col pt-[120px] md:pt-48 lg:pt-[12vw] pb-8 items-stretch">
        <section
          className="soouls-panel flex-1 rounded-[24px] sm:rounded-t-[32px] overflow-hidden flex flex-col p-5 sm:p-6 md:p-12 pb-32 overflow-y-auto custom-scrollbar gap-4 sm:gap-6"
          style={{
            borderColor: 'var(--soouls-border)',
            opacity: 0.96,
          }}
        >
          {/* Title */}
          <div className="mb-2">
            <h1
              className="font-playfair text-3xl sm:text-4xl italic leading-tight sm:text-5xl"
              style={{ color: 'var(--soouls-accent)' }}
            >
              Settings
            </h1>
            <p
              className="mt-2 text-[16px] sm:text-[20px]"
              style={{ color: 'var(--soouls-text-faint)' }}
            >
              Control how Soouls works for you.
            </p>
          </div>

          {/* ─── Top Row (Theme, View, Writing) ─── */}
          <div className="grid gap-4 md:grid-cols-3">
            <SectionCard delay={0.1}>
              <div className="flex h-full flex-col justify-between">
                <p className="text-sm font-medium text-[var(--soouls-text-strong)]">Theme</p>
                <div className="mt-8 flex items-end justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      handlePatch({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
                    }
                    className="text-2xl capitalize transition-opacity hover:opacity-80"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontStyle: 'italic',
                      color: 'var(--soouls-accent)',
                    }}
                  >
                    {settings.themeMode}
                  </button>
                  {settings.themeMode === 'dark' ? (
                    <Moon className="h-5 w-5" style={{ color: 'var(--soouls-accent)' }} />
                  ) : (
                    <Sun className="h-5 w-5" style={{ color: 'var(--soouls-accent)' }} />
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard delay={0.15}>
              <div className="flex h-full flex-col justify-between">
                <p className="text-sm font-medium text-[var(--soouls-text-strong)]">Default view</p>
                <div className="mt-8 flex items-end justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const views: HomeSettings['defaultView'][] = ['canvas', 'list', 'calendar'];
                      handlePatch({
                        defaultView:
                          views[(views.indexOf(settings.defaultView) + 1) % views.length] ??
                          'canvas',
                      });
                    }}
                    className="text-2xl capitalize transition-opacity hover:opacity-80"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontStyle: 'italic',
                      color: 'var(--soouls-accent)',
                    }}
                  >
                    {settings.defaultView}
                  </button>
                  <ChevronDown className="h-5 w-5" style={{ color: 'var(--soouls-accent)' }} />
                </div>
              </div>
            </SectionCard>

            <SectionCard delay={0.2}>
              <div className="flex h-full flex-col justify-between">
                <p className="text-sm font-medium text-[var(--soouls-text-strong)]">Writing mode</p>
                <div className="mt-8 flex items-end justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      handlePatch({
                        writingMode: settings.writingMode === 'minimal' ? 'guided' : 'minimal',
                      })
                    }
                    className="text-2xl capitalize transition-opacity hover:opacity-80"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontStyle: 'italic',
                      color: 'var(--soouls-accent)',
                    }}
                  >
                    {settings.writingMode}
                  </button>
                  <span style={{ color: 'var(--soouls-accent)' }} className="text-xl font-light">
                    ✍
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ─── Accent Color ─── */}
          <SectionCard delay={0.25}>
            <SectionTitle>Personalization</SectionTitle>

            {/* Accent color picker */}
            <SettingRow
              label="Accent color"
              sublabel="Personalize the highlight color"
              icon={<Palette className="h-4 w-4" />}
              right={
                <div className="flex items-center gap-2">
                  {ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePatch({ accentTheme: opt.value })}
                      title={opt.label}
                      className="relative h-6 w-6 rounded-full transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: opt.hex,
                        boxShadow:
                          settings.accentTheme === opt.value
                            ? `0 0 0 2px var(--soouls-bg-surface), 0 0 0 4px ${opt.hex}`
                            : 'none',
                        transform: settings.accentTheme === opt.value ? 'scale(1.15)' : undefined,
                      }}
                      aria-label={`Set accent color to ${opt.label}`}
                      aria-pressed={settings.accentTheme === opt.value}
                    />
                  ))}
                </div>
              }
            />
          </SectionCard>

          {/* ─── Notifications ─── */}
          <SectionCard delay={0.3}>
            <SectionTitle>Notifications</SectionTitle>
            <SettingRow
              label="Daily reminder"
              sublabel="Gentle nudge to reflect on your day"
              icon={<Bell className="h-4 w-4" />}
              right={
                <Toggle
                  on={settings.dailyReminder}
                  onChange={(value) => handlePatch({ dailyReminder: value })}
                />
              }
            />
            <SettingRow
              label="Reflection prompts"
              sublabel="AI-generated questions for deeper thought"
              icon={<Sparkles className="h-4 w-4" />}
              right={
                <Toggle
                  on={settings.reflectionPrompts}
                  onChange={(value) => handlePatch({ reflectionPrompts: value })}
                />
              }
            />
            <SettingRow
              label="Reminder time"
              icon={<Clock className="h-4 w-4" />}
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
                    onClick={() => timeInputRef.current?.showPicker?.()}
                    className="rounded-full border px-3 py-1 text-xs transition-all hover:opacity-80"
                    style={{ borderColor: 'var(--soouls-border)', color: 'var(--soouls-accent)' }}
                  >
                    {formatReminderTime(settings.reminderTime)}
                  </button>
                </>
              }
            />
          </SectionCard>

          {/* ─── AI + App Behavior ─── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard delay={0.4}>
              <SectionTitle>AI Behavior</SectionTitle>
              <div
                className="mb-4 grid grid-cols-3 gap-1 rounded-2xl p-1"
                style={{ backgroundColor: 'var(--soouls-overlay-subtle)' }}
              >
                {(['minimal', 'balanced', 'deep'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handlePatch({ insightDepth: level })}
                    className="rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all duration-200"
                    style={{
                      backgroundColor:
                        settings.insightDepth === level
                          ? 'rgba(var(--soouls-accent-rgb),0.92)'
                          : 'transparent',
                      color: settings.insightDepth === level ? '#fff' : 'var(--soouls-text-faint)',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <SettingRow
                label="Auto clustering"
                right={
                  <Toggle
                    on={settings.autoClustering}
                    onChange={(value) => handlePatch({ autoClustering: value })}
                  />
                }
              />
              <SettingRow
                label="Suggestions"
                right={
                  <Toggle
                    on={settings.suggestions}
                    onChange={(value) => handlePatch({ suggestions: value })}
                  />
                }
              />
            </SectionCard>

            <SectionCard delay={0.5}>
              <SectionTitle>App Behavior</SectionTitle>
              {(['autosave', 'focusMode', 'sessionTracking'] as const).map((key) => (
                <SettingRow
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1')}
                  right={
                    <Toggle
                      on={settings[key]}
                      onChange={(value) => handlePatch({ [key]: value })}
                    />
                  }
                />
              ))}
            </SectionCard>
          </div>

          {/* ─── Privacy ─── */}
          <SectionCard delay={0.6}>
            <SectionTitle>Privacy Controls</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              <SettingRow
                label="Data storage"
                right={
                  <button
                    type="button"
                    onClick={() =>
                      handlePatch({
                        dataStorage: settings.dataStorage === 'local' ? 'cloud' : 'local',
                      })
                    }
                    className="rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all hover:opacity-80"
                    style={{
                      borderColor: 'var(--soouls-border)',
                      color: 'var(--soouls-accent)',
                      backgroundColor: 'var(--soouls-overlay-subtle)',
                    }}
                  >
                    {settings.dataStorage}
                  </button>
                }
              />
              <SettingRow
                label="Data usage"
                right={
                  <button
                    type="button"
                    onClick={() =>
                      handlePatch({
                        dataUsage: settings.dataUsage === 'anonymous' ? 'full' : 'anonymous',
                      })
                    }
                    className="rounded-full border px-3 py-1 text-xs font-medium capitalize transition-all hover:opacity-80"
                    style={{
                      borderColor: 'var(--soouls-border)',
                      color: 'var(--soouls-accent)',
                      backgroundColor: 'var(--soouls-overlay-subtle)',
                    }}
                  >
                    {settings.dataUsage}
                  </button>
                }
              />
            </div>
          </SectionCard>

          {/* ─── Footer actions ─── */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={() => handlePatch(HOME_DEFAULT_SETTINGS)}
              className="rounded-full border px-6 py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ borderColor: 'var(--soouls-border)', color: 'var(--soouls-text-muted)' }}
            >
              Reset App
            </button>
            <button
              type="button"
              onClick={handleClearCache}
              className="rounded-full border px-6 py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{
                borderColor: 'rgba(var(--soouls-accent-rgb),0.4)',
                color: 'var(--soouls-accent)',
              }}
            >
              {cacheMessage ?? 'Clear Cache'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
