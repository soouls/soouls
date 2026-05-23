'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Flame,
  Image as ImageIcon,
  Loader2,
  MessageCircleHeart,
  Mic,
  MoonStar,
  PenLine,
  Sparkles,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  Waves,
  Zap,
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
import { type MascotEmotion, MascotPreview } from '../components/OrbiMascotBase';
import { RoseLoader } from '../components/RoseLoader';

type ThemeColor = 'ember' | 'gold' | 'sage' | 'violet';

type Stage =
  | 'reason'
  | 'expression'
  | 'place'
  | 'rhythm'
  | 'voice'
  | 'mascot'
  | 'name'
  | 'galaxy'
  | 'entry'
  | 'done';

type FlowAnswers = {
  reason?: string;
  expression?: string;
  place?: ThemeColor;
  rhythm?: string;
  voice?: string;
  about?: string;
  userName?: string;
  galaxyName?: string;
};

type Option = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  emotion?: MascotEmotion;
  tone?: ThemeColor;
  sample?: string;
};

const QUESTION_STEPS: Stage[] = ['reason', 'expression', 'place', 'rhythm', 'voice'];
const FLOW_SEQUENCE: Stage[] = [
  'reason',
  'expression',
  'place',
  'rhythm',
  'voice',
  'mascot',
  'name',
  'galaxy',
  'entry',
  'done',
];

const PLACE_COPY: Record<
  ThemeColor,
  {
    name: string;
    headline: string;
    rgb: string;
    accent: string;
    bg: string;
  }
> = {
  gold: {
    name: 'The Clear Horizon',
    headline: 'Turn the noise into insight.',
    rgb: '216, 162, 63',
    accent: '#d8a23f',
    bg: 'radial-gradient(circle at 70% 24%, rgba(216,162,63,.28), transparent 28%), radial-gradient(circle at 25% 75%, rgba(255,255,255,.06), transparent 32%), #050505',
  },
  sage: {
    name: 'The Living Archive',
    headline: 'Watch yourself grow over time.',
    rgb: '116, 173, 134',
    accent: '#74ad86',
    bg: 'radial-gradient(circle at 72% 24%, rgba(116,173,134,.24), transparent 30%), radial-gradient(circle at 20% 78%, rgba(255,255,255,.05), transparent 35%), #050505',
  },
  ember: {
    name: 'A Signal Tower',
    headline: "Fast. Catch the spark before it's gone.",
    rgb: '238, 122, 97',
    accent: '#ee7a61',
    bg: 'radial-gradient(circle at 72% 24%, rgba(238,122,97,.28), transparent 28%), radial-gradient(circle at 26% 76%, rgba(255,176,112,.08), transparent 34%), #050505',
  },
  violet: {
    name: 'A Depth Chamber',
    headline: "Slow. Reflective. Somewhere you can't go out there.",
    rgb: '141, 121, 214',
    accent: '#8d79d6',
    bg: 'radial-gradient(circle at 72% 24%, rgba(141,121,214,.3), transparent 30%), radial-gradient(circle at 22% 78%, rgba(255,255,255,.05), transparent 34%), #050505',
  },
};

const STAR_FIELD = Array.from({ length: 36 }).map((_, index) => ({
  id: `star-${index}`,
  left: `${(index * 47) % 100}%`,
  top: `${(index * 83) % 100}%`,
  size: 1 + (index % 3),
  delay: (index % 9) * 0.38,
}));

const REASON_OPTIONS: Option[] = [
  {
    id: 'head-loud',
    title: 'Clear my mind',
    description:
      'My head is too loud right now. I need to get something out before it swallows me.',
    icon: <Waves className="h-5 w-5" />,
    emotion: 'calm',
  },
  {
    id: 'pattern',
    title: 'Track habits and growth',
    description:
      "I don't understand why I keep doing this. I want to figure out a pattern in myself.",
    icon: <Brain className="h-5 w-5" />,
    emotion: 'curious',
  },
  {
    id: 'changed',
    title: 'Process emotion and reflection',
    description: "Something just changed. I'm at a beginning and I want to document it properly.",
    icon: <Sprout className="h-5 w-5" />,
    emotion: 'excited',
  },
  {
    id: 'create',
    title: 'Creative writing',
    description: "No reason. I just want to create something that's only mine.",
    icon: <Sparkles className="h-5 w-5" />,
    emotion: 'happy',
  },
];

const EXPRESSION_OPTIONS: Option[] = [
  {
    id: 'stream',
    title: 'In long, flowing streams',
    description: "One thought leads to the next. I can't outline. I discover by writing.",
    icon: <PenLine className="h-5 w-5" />,
    emotion: 'content',
  },
  {
    id: 'guided',
    title: 'In structured, prompted steps',
    description: 'I do better with a question to answer. Blank pages intimidate me.',
    icon: <MessageCircleHeart className="h-5 w-5" />,
    emotion: 'focused',
  },
  {
    id: 'voice',
    title: 'In short, voice notes',
    description: 'I talk instead of typing. I think in bursts and need to catch them fast.',
    icon: <Mic className="h-5 w-5" />,
    emotion: 'energetic',
  },
  {
    id: 'mixed',
    title: 'In images, moods, and mixed forms',
    description: 'Sometimes a drawing, sometimes three words. Never linear.',
    icon: <ImageIcon className="h-5 w-5" />,
    emotion: 'inspired',
  },
];

const PLACE_OPTIONS: Option[] = [
  {
    id: 'gold',
    title: 'The Clear Horizon',
    description: 'Turn the noise into insight.',
    icon: <Sun className="h-5 w-5" />,
    emotion: 'thankful',
    tone: 'gold',
  },
  {
    id: 'sage',
    title: 'The Living Archive',
    description: 'Watch yourself grow over time.',
    icon: <Sprout className="h-5 w-5" />,
    emotion: 'hopeful',
    tone: 'sage',
  },
  {
    id: 'ember',
    title: 'A Signal Tower',
    description: "Fast. Frictionless. Capture the spark before it's gone.",
    icon: <Zap className="h-5 w-5" />,
    emotion: 'energetic',
    tone: 'ember',
  },
  {
    id: 'violet',
    title: 'A Depth Chamber',
    description: "Slow. Reflective. I come here when I want to go somewhere I can't go out there.",
    icon: <Waves className="h-5 w-5" />,
    emotion: 'atPeace',
    tone: 'violet',
  },
];

const RHYTHM_OPTIONS: Option[] = [
  {
    id: 'morning',
    title: 'First thing every day',
    description: 'Before the day touches me. Coffee, quiet, the hour that belongs only to me.',
    icon: <Sunrise className="h-5 w-5" />,
    emotion: 'thankful',
  },
  {
    id: 'whenever',
    title: 'Whenever it hits',
    description: 'Unpredictable. Mid-meeting, mid-shower, 2pm on a Tuesday. I need speed.',
    icon: <Zap className="h-5 w-5" />,
    emotion: 'determined',
  },
  {
    id: 'evening',
    title: 'After the noise ends',
    description: 'Evening. When I finally sit down and process what actually happened.',
    icon: <Sunset className="h-5 w-5" />,
    emotion: 'calm',
  },
  {
    id: 'night',
    title: "Late. When it's quiet enough.",
    description: 'Night. When the day is finished and the real thoughts finally show up.',
    icon: <MoonStar className="h-5 w-5" />,
    emotion: 'sleepy',
  },
];

const VOICE_OPTIONS: Option[] = [
  {
    id: 'quiet',
    title: "Don't.",
    description: "Give me a blank page. I don't want prompts or nudges.",
    sample: 'The AI stays silent unless you ask it a direct question.',
    icon: <MoonStar className="h-5 w-5" />,
    emotion: 'calm',
  },
  {
    id: 'gentle',
    title: 'Gently.',
    description: 'Occasionally ask me something soft that makes me think.',
    sample: "What's something small that went better than you expected this week?",
    icon: <MessageCircleHeart className="h-5 w-5" />,
    emotion: 'happy',
  },
  {
    id: 'honest',
    title: 'Honestly.',
    description: "Push past what's comfortable. Ask me what I'd rather not look at.",
    sample: "What are you telling yourself that you already know isn't true?",
    icon: <Flame className="h-5 w-5" />,
    emotion: 'focused',
  },
  {
    id: 'deep',
    title: 'Deeply.',
    description: 'Go all the way. I want to be genuinely challenged.',
    sample: 'Your last four entries all circled the same thing. Do you want to name it?',
    icon: <Waves className="h-5 w-5" />,
    emotion: 'spectral',
  },
];

const ABOUT_CHIPS = [
  'stop losing the thoughts that actually matter to me',
  'understand why I keep making the same choices',
  'have proof of the life I actually lived',
  'feel less alone inside my own head',
];

const ENTRY_PLACEHOLDERS = [
  'Even "I have no idea why I am here" is the right answer.',
  "Say the thing you'd only say here.",
  'What do you refuse to forget today?',
];

function deriveSettings(answers: FlowAnswers, theme: ThemeColor) {
  const reminderByRhythm: Record<string, string> = {
    morning: '07:30',
    whenever: '13:00',
    evening: '20:00',
    night: '22:30',
  };

  return {
    themeMode: 'dark' as const,
    accentTheme: theme,
    writingMode: answers.expression === 'guided' ? ('guided' as const) : ('minimal' as const),
    defaultView: answers.expression === 'voice' ? ('list' as const) : ('canvas' as const),
    insightDepth:
      answers.voice === 'deep'
        ? ('deep' as const)
        : answers.voice === 'honest'
          ? ('balanced' as const)
          : ('minimal' as const),
    dailyReminder: answers.rhythm !== 'whenever',
    reflectionPrompts: answers.voice !== 'quiet',
    suggestions: answers.voice !== 'quiet',
    reminderTime:
      reminderByRhythm[answers.rhythm ?? 'evening'] ?? HOME_DEFAULT_SETTINGS.reminderTime,
  };
}

function BackgroundField({ theme, emptied }: { theme: ThemeColor; emptied: boolean }) {
  const current = PLACE_COPY[theme];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: emptied ? '#000' : current.bg }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: emptied ? 0 : 0.68 }}
        transition={{ duration: 1.6 }}
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,.96), rgba(0,0,0,.72) 44%, rgba(0,0,0,.9)), radial-gradient(circle at 50% 50%, rgba(255,255,255,.06), transparent 52%)',
        }}
      />
      {STAR_FIELD.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: emptied ? [0, 0.12, 0] : [0.08, 0.64, 0.12],
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{
            duration: 3.8,
            delay: star.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,.88)_72%)]" />
    </div>
  );
}

function ProgressHeader({ step }: { step: number }) {
  return (
    <div className="mb-5 flex flex-col items-center gap-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.46em] text-white/38">
        Calibration {String(step).padStart(2, '0')} / 05
      </div>
      <div className="flex items-center gap-2">
        {QUESTION_STEPS.map((item, index) => (
          <span
            key={item}
            className="h-[3px] rounded-full transition-all"
            style={{
              width: index < step ? 44 : 28,
              background:
                index < step ? 'rgba(var(--soouls-accent-rgb), .95)' : 'rgba(255,255,255,.14)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChoiceCard({
  option,
  selected,
  onClick,
  onHover,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
  onHover?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className="group relative min-h-[154px] overflow-hidden rounded-[8px] border p-4 text-left transition-colors"
      style={{
        borderColor: selected ? 'rgba(var(--soouls-accent-rgb), .74)' : 'rgba(255,255,255,.1)',
        background: selected
          ? 'linear-gradient(135deg, rgba(var(--soouls-accent-rgb), .22), rgba(255,255,255,.055))'
          : 'rgba(12,12,12,.76)',
        boxShadow: selected
          ? '0 0 44px rgba(var(--soouls-accent-rgb), .16), inset 0 1px 0 rgba(255,255,255,.08)'
          : 'inset 0 1px 0 rgba(255,255,255,.035)',
      }}
    >
      <div className="relative z-10 flex h-full gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--soouls-accent)]">
          {option.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3
              className="text-[1.28rem] leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
            >
              {option.title}
            </h3>
            {option.emotion ? (
              <div className="-mt-5 hidden shrink-0 sm:block">
                <MascotPreview emotion={option.emotion} label={`${option.title} mascot`} />
              </div>
            ) : null}
          </div>
          <p className="max-w-[33rem] text-sm leading-relaxed text-white/62">
            {option.description}
          </p>
          {option.sample ? (
            <p className="mt-3 border-l border-white/16 pl-3 text-xs leading-relaxed text-white/42">
              {option.sample}
            </p>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

function QuestionScreen({
  kicker,
  title,
  note,
  options,
  selected,
  onSelect,
  onHover,
}: {
  kicker: string;
  title: string;
  note: string;
  options: Option[];
  selected?: string;
  onSelect: (option: Option) => void;
  onHover?: (option: Option) => void;
}) {
  return (
    <section className="mx-auto w-full max-w-[980px]">
      <div className="mb-8 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.38em] text-[var(--soouls-accent)]">
          {kicker}
        </p>
        <h1
          className="mx-auto max-w-[820px] text-[2.35rem] leading-[.98] text-white sm:text-[4.2rem]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[660px] text-sm leading-relaxed text-white/52 sm:text-base">
          {note}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            option={option}
            selected={selected === option.id}
            onClick={() => onSelect(option)}
            onHover={onHover ? () => onHover(option) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function MascotStage({
  answers,
  awake,
  onWake,
}: {
  answers: FlowAnswers;
  awake: boolean;
  onWake: () => void;
}) {
  const emotion = useMemo<MascotEmotion>(() => {
    if (!awake) return 'sleepy';
    if (answers.reason === 'head-loud') return 'calm';
    if (answers.reason === 'pattern') return 'curious';
    if (answers.reason === 'changed') return 'excited';
    if (answers.reason === 'create') return 'happy';
    return 'neutral';
  }, [answers.reason, awake]);

  return (
    <section className="flex min-h-[68vh] flex-col items-center justify-center text-center">
      <motion.button
        type="button"
        onClick={onWake}
        className="relative border-0 bg-transparent p-0"
        animate={awake ? { scale: [1, 1.08, 1], filter: 'brightness(1.16)' } : { scale: 0.82 }}
        transition={{ duration: awake ? 1.2 : 0.8 }}
      >
        <MascotPreview emotion={emotion} label="Wake the Soouls companion" />
      </motion.button>

      <AnimatePresence>
        {awake ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10 max-w-[620px]"
          >
            <p
              className="text-[1.9rem] leading-tight text-white sm:text-[2.8rem]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
            >
              I&apos;ve been calibrated to you.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/58">
              I know why you came. I know what kind of voice you want. I&apos;m ready when you are.
            </p>
            <p className="mt-8 text-xl text-white">What should I call you?</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
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
  const [theme, setTheme] = useState<ThemeColor>('ember');
  const [direction, setDirection] = useState(0);
  const [mascotAwake, setMascotAwake] = useState(false);
  const [firstEntry, setFirstEntry] = useState('');
  const [entryPlaceholderIndex, setEntryPlaceholderIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [genesisStarted, setGenesisStarted] = useState(false);

  const isWaitlistUser = Boolean(
    onboardingStatus?.isWaitlistUser || user?.publicMetadata?.isWaitlistUser,
  );
  const questionStep = QUESTION_STEPS.includes(stage) ? QUESTION_STEPS.indexOf(stage) + 1 : null;
  const currentTone = PLACE_COPY[theme];

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
        setAnswers((current) => ({
          ...current,
          userName: current.userName ?? user.firstName ?? user.fullName ?? '',
        }));
      }
    }
  }, [isLoaded, onboardingStatus, router, user]);

  useEffect(() => {
    previewTheme(theme, 'dark');
  }, [previewTheme, theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEntryPlaceholderIndex((index) => (index + 1) % ENTRY_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const canContinue = useMemo(() => {
    if (stage === 'reason') return Boolean(answers.reason);
    if (stage === 'expression') return Boolean(answers.expression);
    if (stage === 'place') return Boolean(answers.place);
    if (stage === 'rhythm') return Boolean(answers.rhythm);
    if (stage === 'voice') return Boolean(answers.voice);
    if (stage === 'name') return Boolean(answers.userName?.trim());
    if (stage === 'galaxy') return Boolean(answers.galaxyName?.trim());
    return true;
  }, [answers, stage]);

  const goNext = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const next = FLOW_SEQUENCE[index + 1];
    if (!next) return;
    setDirection(1);
    setStage(next);
    setSaveError(null);
  }, [stage]);

  const goBack = useCallback(() => {
    const index = FLOW_SEQUENCE.indexOf(stage);
    const previous = FLOW_SEQUENCE[index - 1];
    if (!previous) return;
    setDirection(-1);
    setStage(previous);
    setSaveError(null);
  }, [stage]);

  const chooseAnswer = useCallback(
    <T extends keyof FlowAnswers>(key: T, value: FlowAnswers[T]) => {
      setAnswers((current) => ({ ...current, [key]: value }));
      if (key === 'place' && value) {
        const nextTheme = value as ThemeColor;
        setTheme(nextTheme);
        previewTheme(nextTheme, 'dark');
      }
    },
    [previewTheme],
  );

  const handleWake = useCallback(() => {
    if (mascotAwake) {
      setDirection(1);
      setStage('name');
      return;
    }

    setMascotAwake(true);
    window.localStorage.setItem('soouls-orbi-awake', 'true');
    setTimeout(() => {
      setDirection(1);
      setStage('name');
    }, 3200);
  }, [mascotAwake]);

  const handleFinish = useCallback(
    async (skipEntry = false) => {
      if (!user) return;

      const trimmedName = answers.userName?.trim() || user.firstName || user.fullName || 'Explorer';
      const trimmedSpace = answers.galaxyName?.trim() || `${trimmedName}'s Mind`;
      const trimmedEntry = firstEntry.trim();
      const settingsPatch = deriveSettings(answers, theme);

      setIsFinishing(true);
      setSaveError(null);
      setGenesisStarted(Boolean(trimmedEntry) && !skipEntry);

      try {
        await updateSettings.mutateAsync(settingsPatch);
        await updateUser.mutateAsync({
          name: trimmedName,
          mascot: 'Soouls',
          themePreference: theme,
          preferences: {
            ...settingsPatch,
            onboardingCompleted: true,
            onboardingRoomName: trimmedSpace,
            onboardingAbout: answers.about?.trim() || null,
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
                guide: 'Soouls',
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

        setTimeout(
          () => {
            setStage('done');
          },
          trimmedEntry && !skipEntry ? 1500 : 0,
        );
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'We could not finish setup yet.');
        setGenesisStarted(false);
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

  if (isLoadingAuth || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <RoseLoader className="h-16 w-16" color="var(--soouls-accent)" />
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-[#050505] text-white"
      style={
        {
          '--soouls-accent': currentTone.accent,
          '--soouls-accent-rgb': currentTone.rgb,
        } as React.CSSProperties
      }
    >
      <BackgroundField theme={theme} emptied={stage === 'mascot'} />

      <div className="relative z-10 flex h-full flex-col px-4 pt-4 pb-24 sm:px-8 lg:px-10">
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="text-[34px] font-semibold leading-none tracking-[-0.06em] text-white/86 sm:text-[48px]"
          >
            Soouls
          </Link>
        </div>

        <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col items-center justify-center">
          {questionStep ? <ProgressHeader step={questionStep} /> : null}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stage}
              custom={direction}
              initial={{ opacity: 0, x: direction >= 0 ? 34 : -34, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction >= 0 ? -34 : 34, scale: 0.985 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="w-full"
            >
              {stage === 'reason' ? (
                <QuestionScreen
                  kicker="Question 1"
                  title="Why are you here today?"
                  note="Not someday. Not in theory. Why did you open this today?"
                  options={REASON_OPTIONS}
                  selected={answers.reason}
                  onSelect={(option) => chooseAnswer('reason', option.id)}
                />
              ) : null}

              {stage === 'expression' ? (
                <QuestionScreen
                  kicker="Question 2"
                  title="How do you express yourself?"
                  note="How does thought actually move through you before any app shapes it?"
                  options={EXPRESSION_OPTIONS}
                  selected={answers.expression}
                  onSelect={(option) => chooseAnswer('expression', option.id)}
                />
              ) : null}

              {stage === 'place' ? (
                <QuestionScreen
                  kicker="Question 3"
                  title="What do you want this place to feel like?"
                  note={`${currentTone.name}. ${currentTone.headline}`}
                  options={PLACE_OPTIONS}
                  selected={answers.place}
                  onSelect={(option) => chooseAnswer('place', option.tone ?? 'ember')}
                  onHover={(option) => {
                    if (option.tone) setTheme(option.tone);
                  }}
                />
              ) : null}

              {stage === 'rhythm' ? (
                <QuestionScreen
                  kicker="Question 4"
                  title="When does your real thinking happen?"
                  note="Not when you want to journal. When thought actually arrives."
                  options={RHYTHM_OPTIONS}
                  selected={answers.rhythm}
                  onSelect={(option) => chooseAnswer('rhythm', option.id)}
                />
              ) : null}

              {stage === 'voice' ? (
                <div className="mx-auto w-full max-w-[980px]">
                  <QuestionScreen
                    kicker="Question 5"
                    title="How should the app talk to you?"
                    note="This sets the relationship, not just a setting."
                    options={VOICE_OPTIONS}
                    selected={answers.voice}
                    onSelect={(option) => chooseAnswer('voice', option.id)}
                  />

                  <div className="mx-auto mt-5 max-w-[760px] rounded-[8px] border border-white/10 bg-black/30 p-4">
                    <label
                      htmlFor="about"
                      className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40"
                    >
                      Optional
                    </label>
                    <textarea
                      id="about"
                      value={answers.about ?? ''}
                      onChange={(event) => chooseAnswer('about', event.target.value)}
                      placeholder="I'll know this is working when I..."
                      className="mt-3 min-h-[84px] w-full resize-none rounded-[8px] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/28 focus:border-[rgba(var(--soouls-accent-rgb),.65)]"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ABOUT_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => chooseAnswer('about', chip)}
                          className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/44 transition hover:text-white"
                        >
                          ...{chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {stage === 'mascot' ? (
                <MascotStage answers={answers} awake={mascotAwake} onWake={handleWake} />
              ) : null}

              {stage === 'name' ? (
                <section className="mx-auto max-w-[680px] text-center">
                  <MascotPreview emotion="happy" label="Happy Soouls mascot" />
                  <p className="mt-4 text-lg text-white/68">
                    Got it{answers.userName?.trim() ? `, ${answers.userName.trim()}` : ''}. One more
                    thing.
                  </p>
                  <h1
                    className="mt-3 text-[2.8rem] leading-none text-white sm:text-[4.4rem]"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                  >
                    What name do you carry?
                  </h1>
                  <input
                    value={answers.userName ?? ''}
                    onChange={(event) => chooseAnswer('userName', event.target.value)}
                    placeholder="What name do you carry?"
                    className="mt-8 w-full rounded-[8px] border border-white/12 bg-white/[0.045] px-5 py-4 text-center text-xl text-white outline-none placeholder:text-white/25 focus:border-[rgba(var(--soouls-accent-rgb),.7)]"
                  />
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/34">
                    The companion will use this. Nobody else will ever see it.
                  </p>
                </section>
              ) : null}

              {stage === 'galaxy' ? (
                <section className="mx-auto max-w-[760px] text-center">
                  <div className="fixed bottom-6 right-6 z-20 scale-[.72]">
                    <MascotPreview emotion="curious" label="Curious Soouls mascot" />
                  </div>
                  <h1
                    className="text-[2.8rem] leading-none text-white sm:text-[4.8rem]"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                  >
                    What do you want to call this place?
                  </h1>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['The Vault', `${answers.userName?.trim() || 'My'}'s Mind`, 'The Unnamed'].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => chooseAnswer('galaxyName', suggestion)}
                          className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/44 transition hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ),
                    )}
                  </div>
                  <input
                    value={answers.galaxyName ?? ''}
                    onChange={(event) => chooseAnswer('galaxyName', event.target.value)}
                    placeholder="Name it what it feels like."
                    className="mt-8 w-full rounded-[8px] border border-white/12 bg-white/[0.045] px-5 py-4 text-center text-xl text-white outline-none placeholder:text-white/25 focus:border-[rgba(var(--soouls-accent-rgb),.7)]"
                  />
                </section>
              ) : null}

              {stage === 'entry' ? (
                <section className="mx-auto max-w-[840px] text-center">
                  <div className="mb-8 text-[2rem] leading-none text-white/92 sm:text-[3rem]">
                    {answers.galaxyName || `${answers.userName || 'Your'}'s Mind`}
                  </div>
                  <p
                    className="text-[1.65rem] leading-tight text-white sm:text-[2.5rem]"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Your universe is waiting.
                    <br />
                    What&apos;s actually on your mind right now?
                  </p>
                  <div className="relative mx-auto mt-8 max-w-[720px]">
                    <textarea
                      value={firstEntry}
                      onChange={(event) => setFirstEntry(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                          void handleFinish(false);
                        }
                      }}
                      placeholder={ENTRY_PLACEHOLDERS[entryPlaceholderIndex]}
                      className="min-h-[190px] w-full resize-none rounded-[8px] border border-white/12 bg-black/42 px-5 py-5 text-lg leading-relaxed text-white shadow-[0_0_70px_rgba(var(--soouls-accent-rgb),.08)] outline-none placeholder:text-white/30 focus:border-[rgba(var(--soouls-accent-rgb),.7)]"
                    />
                    {genesisStarted ? (
                      <motion.div
                        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="h-4 w-4 rounded-full bg-white shadow-[0_0_80px_30px_rgba(255,255,255,.45)]"
                          animate={{ scale: [1, 46], opacity: [1, 0] }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </motion.div>
                    ) : null}
                  </div>
                  {saveError ? (
                    <div className="mx-auto mt-5 max-w-[620px] rounded-[8px] border border-red-300/25 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                      {saveError}
                    </div>
                  ) : null}
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleFinish(true)}
                      disabled={isFinishing}
                      className="rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-xs uppercase tracking-[0.2em] text-white/45 transition hover:text-white disabled:opacity-40"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFinish(false)}
                      disabled={isFinishing}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--soouls-accent)] px-7 py-3 text-sm font-bold uppercase tracking-[0.22em] text-black disabled:opacity-40"
                    >
                      {isFinishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {firstEntry.trim() ? 'Create Node #001' : 'Enter empty universe'}
                      {!isFinishing ? <ArrowRight className="h-4 w-4" /> : null}
                    </button>
                  </div>
                </section>
              ) : null}

              {stage === 'done' ? (
                <section className="mx-auto max-w-[760px] text-center">
                  <MascotPreview emotion="atPeace" label="At peace Soouls mascot" />
                  <div className="mt-3 text-xs uppercase tracking-[0.3em] text-white/42">
                    {answers.galaxyName || 'Your Universe'} · Node #001 · Genesis Complete
                  </div>
                  <h1
                    className="mt-5 text-[2.8rem] leading-none text-white sm:text-[4.4rem]"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                  >
                    Your universe is alive.
                  </h1>
                  <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-white/58">
                    {answers.galaxyName || 'This place'}. Good. One thought was enough to start it.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/home')}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--soouls-accent)] px-7 py-3 text-sm font-bold uppercase tracking-[0.22em] text-black"
                  >
                    Enter home
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {questionStep || stage === 'name' || stage === 'galaxy' ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
          <div className="pointer-events-auto flex w-full max-w-[380px] items-center justify-between rounded-full border border-white/12 bg-black/70 px-2 py-2 shadow-[0_20px_70px_rgba(0,0,0,.5)] backdrop-blur-xl">
            <button
              type="button"
              onClick={goBack}
              disabled={stage === 'reason'}
              className="inline-flex items-center gap-2 px-4 text-xs uppercase tracking-[0.2em] text-white/48 disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--soouls-accent)] px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black disabled:opacity-35"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="sr-only">{currentTone.name}</div>
    </div>
  );
}
