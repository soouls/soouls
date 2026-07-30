'use client';

import { DotmCircular5 } from '@/components/ui/dotm-circular-5';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Flame,
  Image as ImageIcon,
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

type ThemeColor = 'ember' | 'gold' | 'sage' | 'violet';

type Stage =
  | 'reason'
  | 'expression'
  | 'place'
  | 'rhythm'
  | 'voice'
  | 'about'
  | 'mascot'
  | 'entry'
  | 'done';

type FlowAnswers = {
  reason?: string;
  expression?: string;
  place?: ThemeColor;
  rhythm?: string;
  voice?: string;
  about?: string;
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
  'about',
  'mascot',
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
      style={{
        background: emptied
          ? '#000'
          : `${current.bg}, radial-gradient(circle at 50% 38%, rgba(var(--soouls-accent-rgb), .1), transparent 34%), #050505`,
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: emptied ? 0.28 : 0.78 }}
        transition={{ duration: 1.6 }}
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,.98), rgba(0,0,0,.58) 46%, rgba(0,0,0,.92)), radial-gradient(ellipse at 50% 42%, rgba(255,255,255,.075), transparent 58%)',
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,.54)_55%,rgba(0,0,0,.92)_82%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.76))]" />
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
            className="h-[3px] rounded-full transition-colors transition-transform transition-shadow"
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
  onHoverEnd,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onFocus={onHover}
      onBlur={onHoverEnd}
      whileTap={{ scale: 0.97 }}
      className="group relative min-h-[154px] overflow-hidden rounded-2xl border p-5 text-left transition-colors hover:border-[rgba(var(--soouls-accent-rgb),.46)] hover:bg-[rgba(var(--soouls-accent-rgb),.08)]"
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
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
            {selected ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--soouls-accent)]" />
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
  onHoverEnd,
}: {
  kicker: string;
  title: string;
  note: string;
  options: Option[];
  selected?: string;
  onSelect: (option: Option) => void;
  onHover?: (option: Option) => void;
  onHoverEnd?: () => void;
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
            onHoverEnd={onHoverEnd}
          />
        ))}
      </div>
    </section>
  );
}

function AboutStage({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="mx-auto grid w-full max-w-[980px] items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.38em] text-[var(--soouls-accent)]">
          Optional
        </p>
        <h1
          className="text-[2.45rem] leading-[.98] text-white sm:text-[4.35rem]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
        >
          What would make this feel worth returning to?
        </h1>
        <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-white/54 sm:text-base">
          A short sentence is enough. Skip it if the answer needs to arrive later.
        </p>
      </div>

      <div className="rounded-[8px] border border-white/10 bg-black/36 p-4 shadow-[0_24px_90px_rgba(0,0,0,.32)] backdrop-blur-xl sm:p-5">
        <label
          htmlFor="about"
          className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40"
        >
          I&apos;ll know this is working when I...
        </label>
        <textarea
          id="about"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="stop losing the thoughts that actually matter to me"
          className="mt-3 min-h-[180px] w-full resize-none rounded-[8px] border border-white/10 bg-white/[0.035] px-4 py-4 text-base leading-relaxed text-white outline-none placeholder:text-white/28 focus:border-[rgba(var(--soouls-accent-rgb),.65)]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {ABOUT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChange(chip)}
              className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] text-white/48 transition hover:border-[rgba(var(--soouls-accent-rgb),.45)] hover:text-white"
            >
              ...{chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CelebrationModal({ title }: { title: string }) {
  const confetti = Array.from({ length: 26 }).map((_, index) => ({
    id: `confetti-${index}`,
    left: `${(index * 37) % 100}%`,
    delay: (index % 8) * 0.08,
    color: ['#ee7a61', '#d8a23f', '#74ad86', '#8d79d6', '#ffffff'][index % 5],
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-2xl sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {confetti.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-[-24px] h-3 w-1.5 rounded-full"
          style={{ left: piece.left, background: piece.color }}
          animate={{ y: ['0vh', '104vh'], rotate: [0, 160, 330], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.55,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
      <motion.div
        className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/12 bg-[#080808]/92 p-6 text-center shadow-[0_42px_140px_rgba(0,0,0,.72),0_0_80px_rgba(var(--soouls-accent-rgb),.12)] backdrop-blur-2xl sm:p-9"
        initial={{ scale: 0.82, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--soouls-accent-rgb),.9)] to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[220px] w-[520px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(var(--soouls-accent-rgb),.22),transparent_65%)] blur-2xl" />
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-[var(--soouls-accent)] text-black shadow-[0_0_44px_rgba(var(--soouls-accent-rgb),.36)]">
          <Sparkles className="h-7 w-7" />
        </div>
        <p className="relative text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--soouls-accent)]">
          First entry saved
        </p>
        <h2
          className="relative mt-4 text-[2.35rem] leading-[.96] text-white sm:text-[3.35rem]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
        >
          {title || 'Your universe'} is alive.
        </h2>
        <p className="relative mx-auto mt-5 max-w-[390px] text-sm leading-relaxed text-white/62 sm:text-base">
          One honest thought is enough to open the door. Taking you home now.
        </p>
        <div className="relative mx-auto mt-7 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[var(--soouls-accent)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
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
    if (answers.reason === 'head-loud') return 'calm';
    if (answers.reason === 'pattern') return 'curious';
    if (answers.reason === 'changed') return 'excited';
    if (answers.reason === 'create') return 'happy';
    return 'neutral';
  }, [answers.reason]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        id: `wake-particle-${index}`,
        angle: index * 20,
        radius: 90 + (index % 5) * 18,
        delay: (index % 6) * 0.08,
      })),
    [],
  );

  return (
    <section className="relative flex min-h-[68vh] flex-col items-center justify-center overflow-hidden px-3 text-center">
      <motion.div
        className="absolute h-[min(76vw,460px)] w-[min(76vw,460px)] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(var(--soouls-accent-rgb),.2),transparent_62%)]"
        animate={{
          scale: awake ? [0.72, 1.12, 0.96] : [0.86, 0.92, 0.86],
          opacity: awake ? [0.18, 0.62, 0.28] : [0.14, 0.28, 0.14],
          rotate: awake ? [0, 24, -8] : [0, 8, 0],
        }}
        transition={{ duration: awake ? 1.4 : 4, repeat: awake ? 0 : Number.POSITIVE_INFINITY }}
      />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[var(--soouls-accent)] shadow-[0_0_18px_rgba(var(--soouls-accent-rgb),.8)]"
          initial={{ x: -3, y: -3, opacity: 0, scale: 0.4 }}
          animate={
            awake
              ? {
                  x: Math.cos((particle.angle * Math.PI) / 180) * particle.radius,
                  y: Math.sin((particle.angle * Math.PI) / 180) * particle.radius,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.6, 0.2],
                }
              : {
                  x: Math.cos((particle.angle * Math.PI) / 180) * (particle.radius * 0.34),
                  y: Math.sin((particle.angle * Math.PI) / 180) * (particle.radius * 0.34),
                  opacity: [0.08, 0.5, 0.08],
                  scale: [0.4, 1, 0.4],
                }
          }
          transition={{
            duration: awake ? 1.2 : 3.6,
            delay: particle.delay,
            repeat: awake ? 0 : Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {awake ? (
          <motion.div
            key="awake-mascot"
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.42, y: 24, filter: 'brightness(1.7)' }}
            animate={{
              opacity: 1,
              scale: [0.82, 1.18, 0.92],
              y: [0, -18, -28],
              filter: [
                'brightness(1.35) drop-shadow(0 0 42px rgba(var(--soouls-accent-rgb), .9))',
                'brightness(1.12) drop-shadow(0 0 20px rgba(var(--soouls-accent-rgb), .45))',
              ],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.7, ease: 'easeInOut' }}
          >
            <MascotPreview emotion={emotion} label="Soouls companion awakened" />
          </motion.div>
        ) : (
          <motion.button
            key="wake-control"
            type="button"
            onClick={onWake}
            className="relative z-10 flex h-[min(58vw,260px)] w-[min(58vw,260px)] items-center justify-center rounded-full border border-white/12 bg-black/42 shadow-[0_30px_120px_rgba(0,0,0,.55),0_0_80px_rgba(var(--soouls-accent-rgb),.12)] backdrop-blur-2xl transition hover:border-[rgba(var(--soouls-accent-rgb),.55)]"
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: [0.96, 1.02, 0.96] }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            aria-label="Wake the Soouls companion"
          >
            <span className="absolute inset-6 rounded-full border border-[rgba(var(--soouls-accent-rgb),.28)]" />
            <span className="absolute h-20 w-20 rounded-full bg-[var(--soouls-accent)]/18 blur-2xl" />
            <span className="relative flex flex-col items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[var(--soouls-accent)] shadow-[0_0_28px_rgba(var(--soouls-accent-rgb),.85)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--soouls-accent)]">
                Wake companion
              </span>
              <span className="max-w-[180px] text-sm leading-relaxed text-white/52">
                Tap once. The mascot appears only after it wakes.
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {awake ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mt-8 max-w-[620px]"
          >
            <p
              className="text-[1.9rem] leading-tight text-white sm:text-[2.8rem]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
            >
              There you are.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/58">
              Your companion is awake now. It will stay placed and quiet across Soouls until you
              interact with it.
            </p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[var(--soouls-accent)]">
              Opening your first page
            </p>
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
  const [previewTone, setPreviewTone] = useState<ThemeColor>('ember');
  const [direction, setDirection] = useState(0);
  const [mascotAwake, setMascotAwake] = useState(false);
  const [firstEntry, setFirstEntry] = useState('');
  const [entryPlaceholderIndex, setEntryPlaceholderIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const isWaitlistUser = Boolean(
    onboardingStatus?.isWaitlistUser || user?.publicMetadata?.isWaitlistUser,
  );
  const questionStep = QUESTION_STEPS.includes(stage) ? QUESTION_STEPS.indexOf(stage) + 1 : null;
  const visualTheme = stage === 'place' ? previewTone : theme;
  const currentTone = PLACE_COPY[visualTheme];

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

  useEffect(() => {
    if (stage !== 'place') {
      setPreviewTone(theme);
    }
  }, [stage, theme]);

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
    if (stage === 'about') return true;
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
        setPreviewTone(nextTheme);
        previewTheme(nextTheme, 'dark');
      }
    },
    [previewTheme],
  );

  const handleWake = useCallback(() => {
    if (mascotAwake) {
      setDirection(1);
      setStage('entry');
      return;
    }

    setMascotAwake(true);
    window.localStorage.setItem('soouls-orbi-awake', 'true');
    window.dispatchEvent(new Event('soouls-orbi-awake'));
    setTimeout(() => {
      setDirection(1);
      setStage('entry');
    }, 2700);
  }, [mascotAwake]);

  const handleFinish = useCallback(
    async (skipEntry = false) => {
      if (!user) return;

      const trimmedName = user.firstName || user.fullName || 'Explorer';
      const trimmedSpace = `${trimmedName}'s Mind`;
      const trimmedEntry = firstEntry.trim();
      const settingsPatch = deriveSettings(answers, theme);

      setIsFinishing(true);
      setSaveError(null);
      setShowCelebration(false);

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
              userName: trimmedName,
              roomName: trimmedSpace,
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
                  userName: trimmedName,
                  roomName: trimmedSpace,
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

        if (trimmedEntry && !skipEntry) {
          setShowCelebration(true);
          setTimeout(() => {
            router.push('/home?showPricing=true&onboardingCompleted=true');
          }, 1900);
        } else {
          setStage('done');
        }
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'We could not finish setup yet.');
        setShowCelebration(false);
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
      router,
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
        <DotmCircular5 size={24} dotSize={3} color="var(--soouls-accent)" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden overflow-y-auto bg-[#050505] text-white"
      style={
        {
          '--soouls-accent': currentTone.accent,
          '--soouls-accent-rgb': currentTone.rgb,
        } as React.CSSProperties
      }
    >
      <BackgroundField theme={visualTheme} emptied={stage === 'mascot'} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 pt-4 pb-24 sm:px-8 lg:px-10">
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="text-[34px] font-semibold leading-none tracking-[-0.06em] text-white/86 sm:text-[48px]"
          >
            Soouls
          </Link>
        </div>

        <div className="mx-auto flex min-h-0 flex-1 w-full max-w-[1180px] flex-col items-center justify-center py-8">
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
                    if (option.tone) setPreviewTone(option.tone);
                  }}
                  onHoverEnd={() => {
                    setPreviewTone((answers.place as ThemeColor | undefined) ?? theme);
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
                <QuestionScreen
                  kicker="Question 5"
                  title="How should the app talk to you?"
                  note="This sets the relationship, not just a setting."
                  options={VOICE_OPTIONS}
                  selected={answers.voice}
                  onSelect={(option) => chooseAnswer('voice', option.id)}
                />
              ) : null}

              {stage === 'about' ? (
                <AboutStage
                  value={answers.about ?? ''}
                  onChange={(value) => chooseAnswer('about', value)}
                />
              ) : null}

              {stage === 'mascot' ? (
                <MascotStage answers={answers} awake={mascotAwake} onWake={handleWake} />
              ) : null}

              {stage === 'entry' ? (
                <section className="mx-auto w-full max-w-[980px] px-1 text-center sm:px-4">
                  <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/46 shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur-xl">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--soouls-accent)] shadow-[0_0_16px_rgba(var(--soouls-accent-rgb),.8)]" />
                    Genesis space
                  </div>
                  <div className="mb-5 text-[clamp(2rem,7vw,3.25rem)] leading-none text-white/92">
                    {`${user?.firstName || user?.fullName || 'Your'}'s Mind`}
                  </div>
                  <p
                    className="mx-auto max-w-[860px] text-[clamp(2rem,7vw,4rem)] leading-[.98] text-white"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                  >
                    Your universe is waiting.
                    <br />
                    <span className="text-white/82">What&apos;s actually on your mind?</span>
                  </p>
                  <div className="relative mx-auto mt-8 max-w-[780px] sm:mt-10">
                    <div className="pointer-events-none absolute -inset-1 rounded-[30px] bg-[linear-gradient(135deg,rgba(var(--soouls-accent-rgb),.7),rgba(255,255,255,.08),rgba(var(--soouls-accent-rgb),.36))] opacity-80 blur-[1px]" />
                    <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#151515]/82 shadow-[0_34px_120px_rgba(0,0,0,.55),0_0_80px_rgba(var(--soouls-accent-rgb),.1)] backdrop-blur-2xl">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
                      <textarea
                        value={firstEntry}
                        onChange={(event) => setFirstEntry(event.target.value)}
                        onKeyDown={(event) => {
                          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                            void handleFinish(false);
                          }
                        }}
                        placeholder={ENTRY_PLACEHOLDERS[entryPlaceholderIndex]}
                        className="min-h-[190px] w-full resize-none bg-transparent px-5 py-5 text-left text-base leading-relaxed text-white outline-none placeholder:text-white/30 sm:min-h-[230px] sm:px-8 sm:py-7 sm:text-xl"
                      />
                      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white/32 sm:px-8">
                        <span>Private draft</span>
                        <span>{firstEntry.trim().length} chars</span>
                      </div>
                    </div>
                  </div>
                  {saveError ? (
                    <div className="mx-auto mt-5 max-w-[620px] rounded-[8px] border border-red-300/25 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                      {saveError}
                    </div>
                  ) : null}
                  <div className="mt-7 flex items-stretch justify-center gap-3 sm:items-center">
                    <button
                      type="button"
                      onClick={() => handleFinish(false)}
                      disabled={isFinishing}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--soouls-accent)] px-8 py-3.5 text-[15px] font-semibold tracking-tight text-black transition-all active:scale-[0.97] disabled:opacity-40 hover:brightness-110"
                    >
                      {isFinishing ? (
                        <DotmCircular5 size={16} dotSize={2} color="var(--soouls-accent)" />
                      ) : null}
                      {firstEntry.trim() ? 'Create Node #001' : 'Enter empty universe'}
                      {!isFinishing ? <ArrowRight className="h-4 w-4" /> : null}
                    </button>
                  </div>
                </section>
              ) : null}

              {stage === 'done' ? (
                <section className="mx-auto max-w-[760px] text-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/42">
                    Genesis Complete
                  </div>
                  <h1
                    className="mt-5 text-[2.8rem] leading-none text-white sm:text-[4.4rem]"
                    style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500 }}
                  >
                    Your universe is alive.
                  </h1>
                  <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-white/58">
                    Good. One thought was enough to start it.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/home?showPricing=true&onboardingCompleted=true')}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--soouls-accent)] px-7 py-3 text-[15px] font-semibold tracking-tight text-black transition-all active:scale-[0.97] hover:brightness-110"
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

      {questionStep || stage === 'about' ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-5">
          <div className="pointer-events-auto flex w-full max-w-[380px] items-center justify-between rounded-full border border-white/12 bg-[#151515]/60 px-2 py-2 shadow-2xl backdrop-blur-[20px] backdrop-saturate-[180%]">
            <button
              type="button"
              onClick={goBack}
              disabled={stage === 'reason'}
              className="inline-flex items-center gap-2 px-4 text-[15px] font-medium text-white/60 transition-all active:scale-[0.97] disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--soouls-accent)] px-6 py-2.5 text-[15px] font-semibold tracking-tight text-black transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-35"
            >
              {stage === 'about' ? 'Skip' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showCelebration ? (
          <CelebrationModal title={`${user?.firstName || user?.fullName || 'Your'}'s Mind`} />
        ) : null}
      </AnimatePresence>

      <div className="sr-only">{currentTone.name}</div>
    </div>
  );
}
