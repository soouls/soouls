'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Flame,
  Loader2,
  MessageCircleHeart,
  Mic,
  MoonStar,
  PenSquare,
  Sparkles,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HOME_DEFAULT_SETTINGS,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
} from '../../src/hooks/use-home-theme';
import { trpc } from '../../src/utils/trpc';
import { SymbolLogo } from '../components/SymbolLogo';
import { GuideMascot } from './guide-mascot';

type ThemeColor = 'orange' | 'yellow' | 'green' | 'purple';

type Stage =
  | 'reason'
  | 'capture'
  | 'tone'
  | 'rhythm'
  | 'support'
  | 'voice'
  | 'wake'
  | 'entry'
  | 'done';

type FlowAnswers = {
  reason?: string;
  capture?: string;
  tone?: ThemeColor;
  rhythm?: string;
  support?: string;
  voice?: string;
};

type ChoiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  eyebrow?: string;
  mascot?: 'hello' | 'wake';
  mascotAwake?: boolean;
};

const QUESTION_STEPS: Stage[] = ['reason', 'capture', 'tone', 'rhythm', 'support', 'voice'];
const FLOW_SEQUENCE: Stage[] = [
  'reason',
  'capture',
  'tone',
  'rhythm',
  'support',
  'voice',
  'wake',
  'entry',
  'done',
];

const EMBERS = [
  { left: '4%', top: '10%', size: 4, duration: 8.4, delay: 0.2 },
  { left: '14%', top: '82%', size: 5, duration: 10.2, delay: 0.4 },
  { left: '22%', top: '26%', size: 6, duration: 9.4, delay: 1.1 },
  { left: '36%', top: '74%', size: 7, duration: 8.8, delay: 0.8 },
  { left: '48%', top: '15%', size: 8, duration: 11.2, delay: 0.5 },
  { left: '59%', top: '57%', size: 5, duration: 9.8, delay: 1.7 },
  { left: '74%', top: '35%', size: 6, duration: 10.8, delay: 0.9 },
  { left: '84%', top: '18%', size: 5, duration: 8.6, delay: 1.5 },
  { left: '91%', top: '67%', size: 7, duration: 9.6, delay: 0.3 },
];

const THEME_COPY: Record<
  ThemeColor,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  orange: {
    label: 'Orange',
    title: 'Signal fire',
    description: 'Warm, direct, and alive. Best when you want clarity fast.',
  },
  yellow: {
    label: 'Gold',
    title: 'Clear horizon',
    description: 'Brighter and lighter. Good for calm review and steady reflection.',
  },
  green: {
    label: 'Green',
    title: 'Living archive',
    description: 'Grounded, restorative, and growth-oriented.',
  },
  purple: {
    label: 'Purple',
    title: 'Depth chamber',
    description: 'Quiet, introspective, and made for slower inner work.',
  },
};

function getStageNumber(stage: Stage): number {
  switch (stage) {
    case 'reason':
      return 1;
    case 'capture':
      return 2;
    case 'tone':
      return 3;
    case 'rhythm':
      return 4;
    case 'support':
      return 5;
    case 'voice':
      return 6;
    case 'wake':
    case 'entry':
      return 7;
    case 'done':
      return 7;
    default:
      return 1;
  }
}

function deriveSettings(answers: FlowAnswers, theme: ThemeColor) {
  const reminderByRhythm: Record<string, string> = {
    morning: '07:30',
    midday: '13:00',
    evening: '20:00',
    night: '22:30',
  };

  return {
    themeMode: 'dark' as const,
    accentTheme: theme,
    writingMode: answers.capture === 'guided' ? ('guided' as const) : ('minimal' as const),
    defaultView: answers.capture === 'voice' ? ('list' as const) : ('canvas' as const),
    insightDepth:
      answers.voice === 'deep'
        ? ('deep' as const)
        : answers.voice === 'honest'
          ? ('balanced' as const)
          : ('minimal' as const),
    dailyReminder: answers.rhythm !== 'random',
    reflectionPrompts: answers.voice !== 'quiet',
    suggestions: answers.voice !== 'quiet',
    reminderTime:
      reminderByRhythm[answers.rhythm ?? 'evening'] ?? HOME_DEFAULT_SETTINGS.reminderTime,
  };
}

function BackgroundField({ stage }: { stage: Stage }) {
  const stageIndex = FLOW_SEQUENCE.indexOf(stage);
  const progress = stageIndex / (FLOW_SEQUENCE.length - 1);

  return (
    <>
      <div className="absolute inset-0 bg-[#050505]" />
      <motion.div
        animate={{
          x: -progress * 40,
          opacity: 0.8 + progress * 0.2,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 40 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_76%_26%,rgba(94,18,10,0.58),transparent_32%),radial-gradient(circle_at_70%_66%,rgba(121,28,17,0.36),transparent_42%),linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.92)_42%,rgba(24,5,5,0.88)_100%)]"
      />
      <motion.div
        animate={{ x: progress * 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 40 }}
        className="absolute inset-y-0 right-0 w-[48%] bg-[radial-gradient(circle_at_40%_50%,rgba(104,15,10,0.3),transparent_56%)] opacity-90"
      />

      {EMBERS.map((ember, i) => (
        <motion.span
          key={`${ember.left}-${ember.top}-${i}`}
          className="absolute rounded-full bg-[rgba(236,140,102,0.9)] shadow-[0_0_18px_rgba(224,122,95,0.75)]"
          style={{
            left: ember.left,
            top: ember.top,
            width: ember.size,
            height: ember.size,
          }}
          animate={{
            opacity: [0.35, 0.95, 0.45],
            scale: [0.88, 1.28, 0.9],
            y: [0, -progress * 40 - 8, 0],
          }}
          transition={{
            opacity: {
              duration: ember.duration,
              delay: ember.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'mirror',
            },
            scale: {
              duration: ember.duration,
              delay: ember.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'mirror',
            },
            y: {
              type: 'spring',
              damping: 20,
            },
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(var(--soouls-accent-rgb),0.08)_0,transparent_65%)]" />
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--soouls-accent-rgb),0.04)_0,transparent_55%)]"
      />
    </>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
  }),
};

function MiniMascot({ mode }: { mode: 'hello' | 'wake' }) {
  return (
    <div
      className="pointer-events-none absolute right-3 top-4 hidden h-24 w-24 sm:block lg:h-32 lg:w-32"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute left-1/2 top-9 h-20 w-20 -translate-x-1/2 rounded-full border border-white/30 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.98),rgba(255,255,255,0.62)_48%,rgba(255,255,255,0.16))] shadow-[0_0_80px_rgba(255,255,255,0.24)] lg:h-24 lg:w-24">
        <div className="absolute left-5 top-8 h-2 w-5 rounded-full bg-[#0f172a] lg:left-6 lg:top-9" />
        <div className="absolute right-5 top-8 h-2 w-5 rounded-full bg-[#0f172a] lg:right-6 lg:top-9" />
        <div className="absolute bottom-6 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full border-b-[6px] border-[#0f172a]" />
      </div>
      <div className="absolute -top-1 right-0 rounded-[18px] border border-white/15 bg-[rgba(74,45,42,0.92)] px-4 py-3 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-white shadow-[0_16px_30px_rgba(0,0,0,0.28)]">
        {mode === 'hello' ? 'Oh! hello there!' : 'Tap to wake me.'}
      </div>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  icon,
  selected,
  onClick,
  eyebrow,
  mascot,
  mascotAwake,
}: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group relative min-h-[180px] w-full overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 sm:p-6 lg:rounded-[28px]"
      style={{
        borderColor: selected ? 'rgba(var(--soouls-accent-rgb), 0.58)' : 'rgba(255,255,255,0.04)',
        backgroundColor: selected ? 'rgba(43, 22, 18, 0.96)' : 'rgba(28, 16, 14, 0.9)',
        boxShadow: selected
          ? '0 0 30px rgba(var(--soouls-accent-rgb), 0.12), 0 18px 44px rgba(74, 22, 16, 0.38)'
          : '0 14px 38px rgba(73, 20, 13, 0.22)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at center, rgba(var(--soouls-accent-rgb), 0.08) 0%, transparent 70%)',
        }}
      />
      {mascot && mascotAwake ? <MiniMascot mode={mascot} /> : null}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/5 bg-[rgba(255,255,255,0.04)]">
        <span style={{ color: 'var(--soouls-accent)' }}>{icon}</span>
      </div>

      {eyebrow ? (
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[var(--soouls-text-faint)]">
          {eyebrow}
        </p>
      ) : null}

      <h3
        className="max-w-[18rem] text-[1.45rem] leading-[1.08] text-white sm:text-[1.7rem] lg:text-[2rem]"
        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-[28rem] text-sm leading-relaxed text-[rgba(239,235,221,0.68)] sm:text-base">
        {description}
      </p>
    </motion.button>
  );
}

function ProgressHeader({ step }: { step: number }) {
  const markers = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5', 'stage-6', 'stage-7'];

  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      <div className="text-[12px] font-bold uppercase tracking-[0.5em] text-[var(--soouls-accent)] opacity-80">
        {`Discovery Stage ${String(step).padStart(2, '0')}`}
      </div>
      <div className="flex items-center gap-3">
        {markers.map((marker, index) => (
          <div
            key={marker}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: index < step ? 38 : 32,
              backgroundColor:
                index < step ? 'rgba(var(--soouls-accent-rgb), 0.96)' : 'rgba(255,255,255,0.14)',
            }}
          />
        ))}
      </div>
      <div
        className="text-sm uppercase tracking-[0.22em]"
        style={{
          fontFamily: 'var(--font-playfair)',
          fontStyle: 'italic',
          color: 'rgba(var(--soouls-accent-rgb), 0.9)',
        }}
      >
        The discovery
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { user, isLoaded } = useUser();

  const updateUser = trpc.private.users.update.useMutation();
  const updateSettings = trpc.private.home.updateSettings.useMutation();
  const createEntry = trpc.private.entries.create.useMutation();
  const { data: onboardingStatus } = trpc.private.home.getOnboardingStatus.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const [stage, setStage] = useState<Stage>('reason');
  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [theme, setTheme] = useState<ThemeColor>('orange');
  const [mascotAwake, setMascotAwake] = useState(false);
  const [firstEntry, setFirstEntry] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [direction, setDirection] = useState(0);

  const isWaitlistUser = Boolean(
    onboardingStatus?.isWaitlistUser || user?.publicMetadata?.isWaitlistUser,
  );
  const questionStep = QUESTION_STEPS.includes(stage) ? QUESTION_STEPS.indexOf(stage) + 1 : null;

  const previewTheme = useCallback(
    (accentTheme: ThemeColor, themeMode: 'dark' | 'light' = 'dark') => {
      applyHomeTheme({ accentTheme, themeMode });
      utils.private.home.getSettings.setData(undefined, (current) => ({
        ...(current ?? HOME_DEFAULT_SETTINGS),
        accentTheme,
        themeMode,
      }));

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          HOME_THEME_STORAGE_KEY,
          JSON.stringify({
            ...(HOME_DEFAULT_SETTINGS as object),
            accentTheme,
            themeMode,
          }),
        );
      }
    },
    [utils],
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace('/sign-up');
      return;
    }

    if (onboardingStatus) {
      if (onboardingStatus.completed) {
        router.replace('/home');
      } else {
        setIsLoadingAuth(false);
      }
    }
  }, [isLoaded, onboardingStatus, router, user]);

  useEffect(() => {
    previewTheme(theme, 'dark');
  }, [previewTheme, theme]);

  const canContinue = useMemo(() => {
    switch (stage) {
      case 'reason':
        return Boolean(answers.reason);
      case 'capture':
        return Boolean(answers.capture);
      case 'tone':
        return Boolean(answers.tone);
      case 'rhythm':
        return Boolean(answers.rhythm);
      case 'support':
        return Boolean(answers.support);
      case 'voice':
        return Boolean(answers.voice);
      default:
        return true;
    }
  }, [answers, stage]);

  const getStageNumber = useCallback((s: Stage) => {
    return FLOW_SEQUENCE.indexOf(s) + 1;
  }, []);

  const goNext = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const next = FLOW_SEQUENCE[index + 1];
    if (next) {
      setDirection(1);
      setStage(next);
      setSaveError(null);
    }
  }, [stage]);

  const goBack = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const previous = FLOW_SEQUENCE[index - 1];
    if (previous) {
      setDirection(-1);
      setStage(previous);
      setSaveError(null);
    }
  }, [stage]);

  const chooseAnswer = useCallback(
    <T extends keyof FlowAnswers>(key: T, value: FlowAnswers[T]) => {
      setAnswers((current) => ({ ...current, [key]: value }));
      if (key === 'tone' && value) {
        const nextTheme = value as ThemeColor;
        setTheme(nextTheme);
        previewTheme(nextTheme, 'dark');
      }
    },
    [previewTheme],
  );

  const handleWake = useCallback(() => {
    setMascotAwake(true);
    setTimeout(() => {
      setStage('entry');
    }, 1200);
  }, []);

  const handleFinish = useCallback(
    async (skipEntry = false) => {
      if (!user) return;

      const trimmedName = user.firstName || user.fullName || 'Explorer';
      const trimmedSpace = `${trimmedName}'s Room`;
      const trimmedEntry = firstEntry.trim();
      const settingsPatch = deriveSettings(answers, theme);

      setIsFinishing(true);
      setSaveError(null);

      try {
        await updateSettings.mutateAsync(settingsPatch);
        await updateUser.mutateAsync({
          name: trimmedName,
          mascot: 'Orbi',
          themePreference: theme,
          preferences: {
            ...settingsPatch,
            onboardingCompleted: true,
            onboardingRoomName: trimmedSpace,
            onboardingAbout: trimmedEntry || null,
            onboardingAnswers: {
              ...answers,
              tone: theme,
            },
          },
        });

        if (!skipEntry && trimmedEntry) {
          await createEntry.mutateAsync({
            type: 'entry',
            content: JSON.stringify({
              textContent: trimmedEntry,
              blocks: [
                {
                  type: 'paragraph',
                  content: trimmedEntry,
                },
              ],
              metadata: {
                source: 'onboarding',
                isGenesis: true,
                isWaitlistUser,
                guide: 'Orbi',
                roomName: trimmedSpace,
                answers: {
                  ...answers,
                  tone: theme,
                },
              },
            }),
          });
        }

        previewTheme(theme, settingsPatch.themeMode);
        utils.private.home.getSettings.setData(undefined, {
          ...HOME_DEFAULT_SETTINGS,
          ...settingsPatch,
        });

        await Promise.all([
          utils.private.entries.getAll.invalidate(),
          utils.private.entries.getGalaxy.invalidate(),
          utils.private.home.getInsights.invalidate(),
          utils.private.home.getAccount.invalidate(),
          utils.private.home.getClusters.invalidate(),
          utils.private.home.getOnboardingStatus.invalidate(),
        ]);

        setStage('done');
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'We could not finish setup yet.');
      } finally {
        setIsFinishing(false);
      }
    },
    [
      answers,
      createEntry,
      firstEntry,
      isWaitlistUser,
      previewTheme,
      theme,
      updateSettings,
      updateUser,
      user,
      utils.private.entries.getAll,
      utils.private.entries.getGalaxy,
      utils.private.home.getAccount,
      utils.private.home.getClusters,
      utils.private.home.getInsights,
      utils.private.home.getOnboardingStatus,
      utils.private.home.getSettings,
    ],
  );

  const titleTone = theme === 'orange' ? 'today' : THEME_COPY[theme].title.toLowerCase();

  if (isLoadingAuth || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--soouls-accent)]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <BackgroundField stage={stage} />

      <div className="relative z-10 min-h-screen px-4 pb-32 pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center">
          <div className="flex min-w-0 w-full flex-1 flex-col items-center justify-center pt-12 lg:pt-20">
            <div className="mb-12 flex w-full items-center justify-center">
              <Link
                href="/"
                className="text-[42px] font-semibold leading-none tracking-[-0.06em] text-[#e8d5b4] sm:text-[52px]"
              >
                Soouls
              </Link>
            </div>

            {questionStep ? <ProgressHeader step={questionStep} /> : null}

            <div className="w-full max-w-[900px] xl:max-w-[1040px]">
              <AnimatePresence mode="wait" custom={direction}>
                {stage === 'reason' ? (
                  <motion.section
                    key="reason"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[46px] leading-[0.98] text-white drop-shadow-[0_10px_26px_rgba(255,255,255,0.16)] sm:text-[68px] lg:text-[78px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Why are you here{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          today
                        </span>
                        ?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<Wind className="h-7 w-7" />}
                        title="clear my mind"
                        description="My head is too loud right now and I need to get something out before it swallows me."
                        selected={answers.reason === 'mind'}
                        onClick={() => chooseAnswer('reason', 'mind')}
                        mascot="hello"
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Brain className="h-7 w-7" />}
                        title="track habits and growth"
                        description="I do not understand why I keep doing this. I want to figure out a pattern in myself."
                        selected={answers.reason === 'growth'}
                        onClick={() => chooseAnswer('reason', 'growth')}
                        mascot="wake"
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<BookOpenText className="h-7 w-7" />}
                        title="process emotion and self reflection"
                        description="Something just changed. I am at a beginning and want to document it properly."
                        selected={answers.reason === 'reflection'}
                        onClick={() => chooseAnswer('reason', 'reflection')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Sparkles className="h-7 w-7" />}
                        title="creative writing"
                        description="I just want to write. No reason. I just want to create something that is only mine."
                        selected={answers.reason === 'writing'}
                        onClick={() => chooseAnswer('reason', 'writing')}
                        mascotAwake={mascotAwake}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'capture' ? (
                  <motion.section
                    key="capture"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        How do you want to{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          capture it
                        </span>
                        ?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<PenSquare className="h-7 w-7" />}
                        eyebrow="Minimal"
                        title="blank page first"
                        description="Let me write freely and shape it later."
                        selected={answers.capture === 'minimal'}
                        onClick={() => chooseAnswer('capture', 'minimal')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<MessageCircleHeart className="h-7 w-7" />}
                        eyebrow="Guided"
                        title="soft prompts"
                        description="A few good questions help me say the real thing faster."
                        selected={answers.capture === 'guided'}
                        onClick={() => chooseAnswer('capture', 'guided')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Mic className="h-7 w-7" />}
                        eyebrow="Quick capture"
                        title="voice first"
                        description="My thoughts land faster when I can speak them."
                        selected={answers.capture === 'voice'}
                        onClick={() => chooseAnswer('capture', 'voice')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Sparkles className="h-7 w-7" />}
                        eyebrow="Mixed"
                        title="a little of everything"
                        description="Words, sketches, fragments, and patterns all belong in the same room."
                        selected={answers.capture === 'mixed'}
                        onClick={() => chooseAnswer('capture', 'mixed')}
                        mascotAwake={mascotAwake}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'tone' ? (
                  <motion.section
                    key="tone"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Pick the room&apos;s{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          color signal
                        </span>
                        .
                      </h1>
                      <p className="mt-4 text-sm tracking-[0.14em] text-[rgba(239,235,221,0.62)] uppercase">
                        This becomes your app accent everywhere.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {(
                        Object.entries(THEME_COPY) as Array<
                          [ThemeColor, (typeof THEME_COPY)[ThemeColor]]
                        >
                      ).map(([key, item]) => {
                        const selected = answers.tone === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => chooseAnswer('tone', key)}
                            className="rounded-[28px] border p-6 text-left transition-all duration-300"
                            style={{
                              borderColor: selected
                                ? 'rgba(var(--soouls-accent-rgb), 0.48)'
                                : 'rgba(255,255,255,0.04)',
                              backgroundColor: selected
                                ? 'rgba(43, 22, 18, 0.94)'
                                : 'rgba(28, 16, 14, 0.9)',
                              boxShadow: selected
                                ? '0 0 0 1px rgba(var(--soouls-accent-rgb), 0.18), 0 18px 44px rgba(74, 22, 16, 0.38)'
                                : '0 14px 38px rgba(73, 20, 13, 0.22)',
                            }}
                          >
                            <div className="mb-6 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor:
                                      key === 'orange'
                                        ? '#e07a5f'
                                        : key === 'yellow'
                                          ? '#d9a23d'
                                          : key === 'green'
                                            ? '#73b27c'
                                            : '#8c72d8',
                                  }}
                                />
                                <span className="text-xs uppercase tracking-[0.32em] text-[rgba(239,235,221,0.58)]">
                                  {item.label}
                                </span>
                              </div>
                              <div
                                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.26em]"
                                style={{
                                  borderColor: 'rgba(var(--soouls-accent-rgb), 0.32)',
                                  color: 'var(--soouls-accent)',
                                }}
                              >
                                Main UI
                              </div>
                            </div>

                            <h3
                              className="text-[1.85rem] leading-[1.05] text-white sm:text-[2rem]"
                              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                            >
                              {item.title}
                            </h3>
                            <p className="mt-3 text-base leading-relaxed text-[rgba(239,235,221,0.68)]">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'rhythm' ? (
                  <motion.section
                    key="rhythm"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        When does the real{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          reflection
                        </span>{' '}
                        show up?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<Sunrise className="h-7 w-7" />}
                        eyebrow="Reminder 7:30 AM"
                        title="morning"
                        description="Before the day reaches me."
                        selected={answers.rhythm === 'morning'}
                        onClick={() => chooseAnswer('rhythm', 'morning')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Clock3 className="h-7 w-7" />}
                        eyebrow="No fixed reminder"
                        title="whenever it hits"
                        description="I need quick capture more than routine."
                        selected={answers.rhythm === 'random'}
                        onClick={() => chooseAnswer('rhythm', 'random')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Sunset className="h-7 w-7" />}
                        eyebrow="Reminder 8:00 PM"
                        title="evening"
                        description="After the noise ends and I can look back clearly."
                        selected={answers.rhythm === 'evening'}
                        onClick={() => chooseAnswer('rhythm', 'evening')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<MoonStar className="h-7 w-7" />}
                        eyebrow="Reminder 10:30 PM"
                        title="late night"
                        description="When it gets quiet enough to tell the truth."
                        selected={answers.rhythm === 'night'}
                        onClick={() => chooseAnswer('rhythm', 'night')}
                        mascotAwake={mascotAwake}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'support' ? (
                  <motion.section
                    key="support"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        What do you want this platform to{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          hold
                        </span>{' '}
                        for you?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<MessageCircleHeart className="h-7 w-7" />}
                        eyebrow="Release"
                        title="stress entries"
                        description="A place to put the thing down before it becomes the whole day."
                        selected={answers.support === 'stress'}
                        onClick={() => chooseAnswer('support', 'stress')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Brain className="h-7 w-7" />}
                        eyebrow="Patterns"
                        title="self understanding"
                        description="Help me notice loops, triggers, and progress I would otherwise miss."
                        selected={answers.support === 'patterns'}
                        onClick={() => chooseAnswer('support', 'patterns')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<BookOpenText className="h-7 w-7" />}
                        eyebrow="Archive"
                        title="life chapters"
                        description="Keep a living record of what changes and what keeps returning."
                        selected={answers.support === 'chapters'}
                        onClick={() => chooseAnswer('support', 'chapters')}
                        mascotAwake={mascotAwake}
                      />
                      <ChoiceCard
                        icon={<Sparkles className="h-7 w-7" />}
                        eyebrow="Creation"
                        title="ideas and drafts"
                        description="Catch fragments before they disappear and shape them into something."
                        selected={answers.support === 'ideas'}
                        onClick={() => chooseAnswer('support', 'ideas')}
                        mascotAwake={mascotAwake}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'voice' ? (
                  <motion.section
                    key="voice"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <div className="mb-10 text-center">
                      <h1
                        className="text-[40px] leading-[1] text-white sm:text-[60px] lg:text-[68px]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        How should Soouls{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          speak
                        </span>{' '}
                        back?
                      </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ChoiceCard
                        icon={<MoonStar className="h-7 w-7" />}
                        eyebrow="Minimal AI"
                        title="quiet"
                        description="Stay out of my way unless I ask."
                        selected={answers.voice === 'quiet'}
                        onClick={() => chooseAnswer('voice', 'quiet')}
                      />
                      <ChoiceCard
                        icon={<MessageCircleHeart className="h-7 w-7" />}
                        eyebrow="Light prompts"
                        title="gentle"
                        description="Ask soft questions that help me open the door."
                        selected={answers.voice === 'gentle'}
                        onClick={() => chooseAnswer('voice', 'gentle')}
                      />
                      <ChoiceCard
                        icon={<Flame className="h-7 w-7" />}
                        eyebrow="Balanced insight"
                        title="honest"
                        description="Tell me the thing I am trying not to say."
                        selected={answers.voice === 'honest'}
                        onClick={() => chooseAnswer('voice', 'honest')}
                      />
                      <ChoiceCard
                        icon={<Brain className="h-7 w-7" />}
                        eyebrow="Deep analysis"
                        title="deep"
                        description="Pattern-match the whole room and push further."
                        selected={answers.voice === 'deep'}
                        onClick={() => chooseAnswer('voice', 'deep')}
                      />
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'wake' ? (
                  <motion.section
                    key="wake"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--soouls-accent-rgb),0.26)] bg-[rgba(var(--soouls-accent-rgb),0.08)]">
                        <Sunrise className="h-7 w-7" style={{ color: 'var(--soouls-accent)' }} />
                      </div>
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Meet your companion.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[34rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        Orbi is your personal guide through the archive. It learns your rhythm,
                        holds your thoughts, and keeps the light steady.
                      </p>

                      <div className="mt-8 flex flex-col items-center gap-4">
                        <button
                          type="button"
                          onClick={handleWake}
                          className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-sm uppercase tracking-[0.26em] transition-all hover:scale-105 active:scale-95"
                          style={{
                            borderColor: 'rgba(var(--soouls-accent-rgb), 0.4)',
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.12)',
                            color: 'var(--soouls-accent)',
                            boxShadow: '0 0 20px rgba(var(--soouls-accent-rgb), 0.2)',
                          }}
                        >
                          Wake Orbi
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <p className="text-xs uppercase tracking-[0.26em] text-[rgba(239,235,221,0.3)]">
                          {mascotAwake ? 'Your companion has arrived' : 'Signal into the void'}
                        </p>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'entry' ? (
                  <motion.section
                    key="entry"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="mx-auto max-w-[900px]"
                  >
                    <div className="text-center">
                      <div className="mb-4 flex items-center justify-center gap-4">
                        <div className="text-xs uppercase tracking-[0.34em] text-[rgba(239,235,221,0.46)]">
                          The discovery
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFinish(true)}
                          disabled={isFinishing}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 transition hover:text-white disabled:opacity-40"
                        >
                          Skip
                        </button>
                      </div>
                      <h2
                        className="mx-auto max-w-[46rem] text-[2.2rem] leading-[1.04] text-white sm:text-[3rem] lg:text-[3.4rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Finish this: anything you would like your journal to know{' '}
                        <span style={{ color: 'var(--soouls-accent)', fontStyle: 'italic' }}>
                          about you
                        </span>
                        , I&apos;ll know this is working when I...
                      </h2>

                      <div className="mt-8">
                        <textarea
                          value={firstEntry}
                          onChange={(event) => setFirstEntry(event.target.value)}
                          placeholder="Write something about yourself"
                          className="min-h-[220px] w-full rounded-[22px] border bg-[rgba(35,18,17,0.86)] px-5 py-5 text-base leading-relaxed text-white outline-none transition-all placeholder:text-[rgba(239,235,221,0.36)] sm:min-h-[260px] sm:px-6 sm:py-6"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        {[
                          'stop giving the thoughts that actually matter names',
                          'understand why I keep making the same choices',
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => setFirstEntry(prompt)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white/45 transition hover:text-white"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>

                      {saveError ? (
                        <div
                          className="mt-5 rounded-2xl border px-4 py-3 text-sm text-[#ffb6a0]"
                          style={{
                            borderColor: 'rgba(255, 136, 108, 0.32)',
                            backgroundColor: 'rgba(124, 33, 19, 0.28)',
                          }}
                        >
                          {saveError}
                        </div>
                      ) : null}

                      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setStage('wake')}
                          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.24em] text-[rgba(239,235,221,0.55)]"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFinish(false)}
                          disabled={isFinishing}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white disabled:opacity-40"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          {isFinishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {isFinishing
                            ? 'Saving'
                            : firstEntry.trim()
                              ? 'Save and enter'
                              : 'Enter home'}
                          {!isFinishing ? <ArrowRight className="h-4 w-4" /> : null}
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}

                {stage === 'done' ? (
                  <motion.section
                    key="done"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="mx-auto max-w-[760px]"
                  >
                    <div
                      className="rounded-[32px] border px-7 py-10 text-center sm:px-10"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(28, 16, 14, 0.9)',
                        boxShadow: '0 18px 48px rgba(74, 22, 16, 0.34)',
                      }}
                    >
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--soouls-accent-rgb),0.26)] bg-[rgba(var(--soouls-accent-rgb),0.08)]">
                        <CheckCircle2
                          className="h-7 w-7"
                          style={{ color: 'var(--soouls-accent)' }}
                        />
                      </div>
                      <h2
                        className="text-[2.6rem] leading-[1] text-white sm:text-[3.2rem]"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                      >
                        Your room is live.
                      </h2>
                      <p className="mx-auto mt-4 max-w-[35rem] text-base leading-relaxed text-[rgba(239,235,221,0.72)]">
                        We saved your profile, synced your theme, and encrypted the first entry in
                        your archive.
                      </p>

                      <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
                        {[
                          'Profile saved to your account',
                          `Main UI color set to ${THEME_COPY[theme].label}`,
                          'First entry encrypted and stored',
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border px-4 py-4 text-sm text-[rgba(239,235,221,0.74)]"
                            style={{
                              borderColor: 'rgba(255,255,255,0.06)',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => router.push('/home')}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm uppercase tracking-[0.24em] text-white"
                          style={{
                            backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.92)',
                          }}
                        >
                          Enter home
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>

            {questionStep ? (
              <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
                <div
                  className="pointer-events-auto flex w-full max-w-[320px] items-center justify-between rounded-full border px-2 py-2 backdrop-blur-2xl sm:max-w-[360px]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(20, 11, 10, 0.75)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                >
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={questionStep === 1}
                    className="inline-flex items-center gap-2 px-4 text-xs uppercase tracking-[0.26em] text-[rgba(239,235,221,0.5)] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    whileHover={canContinue ? { scale: 1.02, x: 2 } : {}}
                    whileTap={canContinue ? { scale: 0.98 } : {}}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white disabled:opacity-40 transition-shadow"
                    style={{
                      backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.96)',
                      boxShadow: canContinue
                        ? '0 10px 20px rgba(var(--soouls-accent-rgb), 0.2)'
                        : 'none',
                    }}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {mascotAwake && (
        <GuideMascot
          theme={theme}
          step={getStageNumber(stage)}
          awake={mascotAwake}
          isWaitlistUser={isWaitlistUser}
          name={user?.firstName || user?.fullName || undefined}
          firstEntry={firstEntry.trim() || undefined}
          onWake={undefined}
          centered={stage === 'wake' || stage === 'entry'}
        />
      )}

      <div className="sr-only">{titleTone}</div>
    </div>
  );
}
