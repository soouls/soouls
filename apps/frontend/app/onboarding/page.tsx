'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { trpc } from '../../src/utils/trpc';
import { CurveLoader } from '../components/CurveLoader';
import {
  type AtmosphereKey,
  DEFAULT_ATMOSPHERE,
  applyAtmosphereTheme,
} from '../components/profile-theme';

type PurposeKey = 'clear_my_mind' | 'track_habits' | 'process_emotions' | 'creative_writing';
type ExpressionKey = 'flowing_streams' | 'guided_steps' | 'voice_bursts' | 'mixed_media';
type RhythmKey = 'first_thing' | 'whenever_it_hits' | 'after_the_noise' | 'late_at_night';
type ToneKey = 'silent' | 'gentle' | 'honest' | 'deep';

type FlowStep =
  | 'intro'
  | 'purpose'
  | 'expression'
  | 'atmosphere'
  | 'rhythm'
  | 'tone'
  | 'mascot'
  | 'universe'
  | 'success'
  | 'context'
  | 'entry'
  | 'genesis';

type Answers = {
  purpose: PurposeKey | null;
  expressionStyle: ExpressionKey | null;
  atmosphere: AtmosphereKey;
  thinkingRhythm: RhythmKey | null;
  companionTone: ToneKey | null;
  displayName: string;
  universeName: string;
  successDefinition: string;
  journalContext: string;
  firstEntry: string;
};

const FLOW: FlowStep[] = [
  'intro',
  'purpose',
  'expression',
  'atmosphere',
  'rhythm',
  'tone',
  'mascot',
  'universe',
  'success',
  'context',
  'entry',
  'genesis',
];

const purposeOptions = [
  {
    value: 'clear_my_mind' as const,
    title: 'Clear my mind',
    body: 'My head is too loud right now. I need to get something out before it swallows me.',
    reaction: 'Sits completely still. Nods once, very slowly. Looks calm.',
  },
  {
    value: 'track_habits' as const,
    title: 'Track habits and growth',
    body: "I don't understand why I keep doing this. I want to figure out a pattern in myself.",
    reaction: 'Eyes widen slightly. Leans forward. Looks ready.',
  },
  {
    value: 'process_emotions' as const,
    title: 'Process emotion and reflection',
    body: 'Something just changed. I am at a beginning and I want to document it properly.',
    reaction: 'Tiny bounce. Clearly excited. Leans in.',
  },
  {
    value: 'creative_writing' as const,
    title: 'Creative writing',
    body: 'No reason. I just want to create something that is only mine.',
    reaction: 'Smiles. Calm. No drama. Just present.',
  },
];

const expressionOptions = [
  {
    value: 'flowing_streams' as const,
    title: 'Long, flowing streams',
    body: 'One thought leads to the next. I discover by writing, not by outlining.',
  },
  {
    value: 'guided_steps' as const,
    title: 'Structured, prompted steps',
    body: 'A question to answer helps. Blank pages can feel heavier than they should.',
  },
  {
    value: 'voice_bursts' as const,
    title: 'Short voice-note bursts',
    body: 'I think in flashes and need to catch them before they disappear.',
  },
  {
    value: 'mixed_media' as const,
    title: 'Images, moods, mixed forms',
    body: 'Sometimes it is a drawing, sometimes three words. Never fully linear.',
  },
];

const atmosphereOptions = [
  {
    value: 'clear_horizon' as const,
    title: 'The Clear Horizon',
    body: 'Turn the noise into insight.',
  },
  {
    value: 'living_archive' as const,
    title: 'The Living Archive',
    body: 'Watch yourself grow over time.',
  },
  {
    value: 'signal_tower' as const,
    title: 'A Signal Tower',
    body: "Fast and frictionless. I capture the spark in 10 seconds or it's gone.",
  },
  {
    value: 'depth_chamber' as const,
    title: 'A Depth Chamber',
    body: 'Slow and reflective. I come here when I want to go somewhere deeper.',
  },
];

const rhythmOptions = [
  {
    value: 'first_thing' as const,
    title: 'First thing every day',
    body: 'Before the day touches me. Coffee, quiet, the hour that belongs to no one else.',
  },
  {
    value: 'whenever_it_hits' as const,
    title: 'Whenever it hits',
    body: 'Unpredictable. Mid-meeting, mid-shower, 2pm on a Tuesday. I need to catch it fast.',
  },
  {
    value: 'after_the_noise' as const,
    title: 'After the noise ends',
    body: 'Evening or a few times a week, when I finally process what actually happened.',
  },
  {
    value: 'late_at_night' as const,
    title: 'Late. When it is quiet',
    body: 'Night. When the day is finished and the real thoughts finally show up.',
  },
];

const toneOptions = [
  {
    value: 'silent' as const,
    title: "Don't",
    body: 'Give me a blank page. Stay silent unless I ask directly.',
    sample: '"I will stay quiet until you ask for me."',
  },
  {
    value: 'gentle' as const,
    title: 'Gently',
    body: 'Ask me something soft now and then.',
    sample: '"What is something small that went better than you expected this week?"',
  },
  {
    value: 'honest' as const,
    title: 'Honestly',
    body: 'Push past what is comfortable. Ask what I would rather not look at.',
    sample: '"What are you telling yourself that you already know is not true?"',
  },
  {
    value: 'deep' as const,
    title: 'Deeply',
    body: 'Challenge me emotionally and intellectually.',
    sample: '"Your last entries circle the same thing. Do you want to name it?"',
  },
];

const successChips = [
  '...stop losing the thoughts that actually matter to me',
  '...understand why I keep making the same choices',
  '...have proof of the life I actually lived',
  '...feel less alone inside my own head',
];

const contextChips = [
  "I'm going through a career change and want to stay grounded",
  'I am trying to trust my own thoughts again',
  'I want a place that feels private and alive',
  'I need help noticing patterns before they repeat',
];

const successPlaceholders = [
  '...finally understand the pattern',
  '...feel like myself again',
  "…have captured something I won't regret losing",
];

const entryPlaceholders = [
  'Even "I have no idea why I am here" is the right answer.',
  'Say the thing you would only say here.',
  'What do you refuse to forget today?',
];

function onboardingError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return 'Something interrupted the calibration. Please try again.';
}

function QuestionFrame({
  children,
  kicker,
  title,
  subtitle,
  step,
}: {
  children: React.ReactNode;
  kicker: string;
  title: string;
  subtitle: string;
  step: number;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10 text-[var(--app-text)] sm:px-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--app-accent)]">{kicker}</p>
          <CurveLoader className="h-10 w-28" />
        </div>
        <div className="text-xs uppercase tracking-[0.32em] text-[var(--app-text-muted)]">
          Step {step} of 7
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_30px_120px_-56px_var(--app-glow)] sm:p-10">
        <div className="mb-10 max-w-3xl space-y-4">
          <h1 className="font-editorial text-4xl leading-none sm:text-6xl">{title}</h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChoiceCard({
  title,
  body,
  selected,
  onClick,
  onHover,
  sample,
}: {
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
  onHover?: (hovering: boolean) => void;
  sample?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      whileHover={{ y: -4 }}
      className={`group flex w-full flex-col gap-4 rounded-[1.9rem] border p-5 text-left transition ${
        selected
          ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)] shadow-[0_20px_60px_-40px_var(--app-glow)]'
          : 'border-[var(--app-border)] bg-black/10 hover:border-white/10 hover:bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-editorial text-2xl">{title}</h3>
        <div
          className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full border ${
            selected
              ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black'
              : 'border-[var(--app-border)] text-transparent'
          }`}
        >
          <Check className="h-4 w-4" />
        </div>
      </div>
      <p className="text-sm leading-7 text-[var(--app-text-muted)]">{body}</p>
      {sample ? (
        <p
          className="rounded-[1.3rem] bg-black/15 px-4 py-3 text-sm italic"
          style={{ color: 'color-mix(in srgb, var(--app-text) 80%, transparent)' }}
        >
          {sample}
        </p>
      ) : null}
    </motion.button>
  );
}

function FloatingCompanion({
  awake,
  reaction,
  compact = false,
}: {
  awake: boolean;
  reaction?: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      animate={awake ? { scale: 1, y: [0, -8, 0] } : { scale: 0.94, y: [0, -4, 0] }}
      transition={{
        duration: compact ? 3.2 : 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
      className={`relative ${compact ? 'h-28 w-28' : 'h-40 w-40'} cursor-pointer`}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--app-accent-strong),rgba(255,255,255,0.06)_38%,transparent_72%)] blur-md" />
      <div className="absolute inset-[10%] rounded-[46%] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03))] shadow-[0_20px_80px_-30px_var(--app-glow)] backdrop-blur-xl" />
      <div className="absolute inset-x-[23%] top-[38%] flex justify-between">
        <span className="h-4 w-4 rounded-full bg-[#09070a] shadow-[0_0_0_6px_rgba(255,255,255,0.06)] animate-[companion-blink_6s_linear_infinite]" />
        <span className="h-4 w-4 rounded-full bg-[#09070a] shadow-[0_0_0_6px_rgba(255,255,255,0.06)] animate-[companion-blink_6.2s_linear_infinite]" />
      </div>
      <div
        className={`absolute bottom-[24%] left-1/2 h-3 w-12 -translate-x-1/2 rounded-full border-t ${
          awake ? 'border-[var(--app-accent)]' : 'border-white/20'
        }`}
      />
      {!awake ? (
        <div className="absolute -right-2 top-2 text-sm text-[var(--app-text-muted)]">z z</div>
      ) : null}
      {reaction ? (
        <div className="absolute -bottom-12 left-1/2 w-52 -translate-x-1/2 text-center text-xs uppercase tracking-[0.22em] text-[var(--app-text-muted)]">
          {reaction}
        </div>
      ) : null}
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    purpose: null,
    expressionStyle: null,
    atmosphere: DEFAULT_ATMOSPHERE,
    thinkingRhythm: null,
    companionTone: null,
    displayName: '',
    universeName: '',
    successDefinition: '',
    journalContext: '',
    firstEntry: '',
  });
  const [hoverRhythm, setHoverRhythm] = useState<RhythmKey | null>(null);
  const [mascotAwake, setMascotAwake] = useState(false);
  const [activePlaceholderIndex, setActivePlaceholderIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdEntryId, setCreatedEntryId] = useState<string | null>(null);
  const completeOnboarding = trpc.private.profile.completeOnboarding.useMutation();
  const createEntry = trpc.private.entries.create.useMutation();
  const { data: profile, isLoading } = trpc.private.profile.getCurrent.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  const currentStep = FLOW[stepIndex];
  const mascotReaction = useMemo(
    () => purposeOptions.find((option) => option.value === answers.purpose)?.reaction,
    [answers.purpose],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    if (profile?.onboardingCompletedAt) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, profile?.onboardingCompletedAt, router]);

  useEffect(() => {
    applyAtmosphereTheme(answers.atmosphere);
  }, [answers.atmosphere]);

  useEffect(() => {
    const source =
      currentStep === 'success'
        ? successPlaceholders
        : currentStep === 'entry'
          ? entryPlaceholders
          : null;

    if (!source) {
      setActivePlaceholderIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActivePlaceholderIndex((index) => (index + 1) % source.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== 'genesis' || !createdEntryId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace(`/dashboard/new-entry?id=${createdEntryId}`);
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [createdEntryId, currentStep, router]);

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((previous) => ({ ...previous, [key]: value }));
  }

  function advance() {
    setStepIndex((index) => Math.min(index + 1, FLOW.length - 1));
    setError(null);
  }

  function retreat() {
    if (currentStep === 'mascot') {
      setMascotAwake(false);
    }
    setStepIndex((index) => Math.max(index - 1, 0));
    setError(null);
  }

  async function finishOnboarding() {
    if (
      !answers.purpose ||
      !answers.expressionStyle ||
      !answers.thinkingRhythm ||
      !answers.companionTone
    ) {
      setError('A few calibration answers are missing. Go back one step and finish the core flow.');
      return;
    }

    if (!answers.displayName.trim() || !answers.universeName.trim() || !answers.firstEntry.trim()) {
      setError(
        'Your name, universe name, and first entry are all needed before genesis can begin.',
      );
      return;
    }

    setError(null);

    try {
      await completeOnboarding.mutateAsync({
        purpose: answers.purpose,
        expressionStyle: answers.expressionStyle,
        atmosphere: answers.atmosphere,
        thinkingRhythm: answers.thinkingRhythm,
        companionTone: answers.companionTone,
        successDefinition: answers.successDefinition.trim() || null,
        journalContext: answers.journalContext.trim() || null,
        displayName: answers.displayName.trim(),
        universeName: answers.universeName.trim(),
        firstEntry: answers.firstEntry.trim(),
      });

      const entry = await createEntry.mutateAsync({
        content: answers.firstEntry.trim(),
        type: 'entry',
      });

      setCreatedEntryId(entry.id);
      setStepIndex(FLOW.indexOf('genesis'));
    } catch (caughtError) {
      setError(onboardingError(caughtError));
    }
  }

  if (!isLoaded || !isSignedIn || isLoading || profile?.onboardingCompletedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="flex flex-col items-center gap-4">
          <CurveLoader />
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--app-text-muted)]">
            Preparing your calibration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--app-glow),transparent_38%)] opacity-40" />
        <div className="absolute left-1/2 top-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-[var(--app-border)] opacity-25" />
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: hoverRhythm ? 0.35 : 0.16,
            background:
              hoverRhythm === 'first_thing'
                ? 'radial-gradient(circle at 20% 18%, rgba(255,214,138,0.25), transparent 35%)'
                : hoverRhythm === 'whenever_it_hits'
                  ? 'radial-gradient(circle at 52% 42%, rgba(255,255,255,0.12), transparent 25%)'
                  : hoverRhythm === 'after_the_noise'
                    ? 'radial-gradient(circle at 70% 80%, rgba(255,157,101,0.22), transparent 32%)'
                    : hoverRhythm === 'late_at_night'
                      ? 'radial-gradient(circle at 50% 6%, rgba(141,123,231,0.22), transparent 34%)'
                      : 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.06), transparent 30%)',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'intro' ? (
          <motion.main
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--app-border)] bg-black/10 px-5 py-2 text-xs uppercase tracking-[0.36em] text-[var(--app-accent)]">
                <Sparkles className="h-4 w-4" />
                SoulCanvas
              </div>
              <div className="space-y-6">
                <h1 className="font-editorial text-5xl leading-[0.95] sm:text-7xl">
                  A space to think,
                  <br />
                  <span className="italic text-[var(--app-accent-strong)]">reflect and grow.</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-9 text-[var(--app-text-muted)]">
                  Before the dashboard appears, we calibrate the universe around how you actually
                  think. Five core choices. Two optional reflections. Then the first node ignites.
                </p>
              </div>
              <div className="mx-auto mt-12 grid max-w-3xl gap-4">
                {[
                  'Prompts that know your emotional state',
                  'Patterns over time that feel personal',
                  'A private first-entry ritual that starts the galaxy',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.6rem] border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-5 text-left text-[var(--app-text-muted)] shadow-[0_20px_80px_-60px_var(--app-glow)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={advance}
                className="mt-12 inline-flex items-center gap-3 rounded-full bg-[var(--app-accent)] px-10 py-5 text-lg font-semibold text-[#120d0a] shadow-[0_24px_80px_-30px_var(--app-glow)] transition hover:brightness-105"
              >
                Begin my journey
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.main>
        ) : null}

        {currentStep === 'purpose' ? (
          <motion.div
            key="purpose"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 1"
              title="Why are you here today?"
              subtitle="This tells the universe what kind of silence or structure to offer first."
              step={1}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {purposeOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    body={option.body}
                    selected={answers.purpose === option.value}
                    onClick={() => {
                      update('purpose', option.value);
                      window.setTimeout(advance, 180);
                    }}
                  />
                ))}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'expression' ? (
          <motion.div
            key="expression"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 2"
              title="How do you express yourself?"
              subtitle="Each answer rewires the default feel of the editor and the pacing of the product."
              step={2}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {expressionOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    body={option.body}
                    selected={answers.expressionStyle === option.value}
                    onClick={() => {
                      update('expressionStyle', option.value);
                      window.setTimeout(advance, 180);
                    }}
                  />
                ))}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'atmosphere' ? (
          <motion.div
            key="atmosphere"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 3"
              title="What should this place feel like?"
              subtitle="Pick the atmosphere. We will quietly change the palette everywhere else around it."
              step={3}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {atmosphereOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    body={option.body}
                    selected={answers.atmosphere === option.value}
                    onClick={() => {
                      update('atmosphere', option.value);
                      window.setTimeout(advance, 180);
                    }}
                  />
                ))}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'rhythm' ? (
          <motion.div
            key="rhythm"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 4"
              title="When does your real thinking happen?"
              subtitle="Hover each card and the room will hold that energy for a beat before you choose."
              step={4}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {rhythmOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    body={option.body}
                    selected={answers.thinkingRhythm === option.value}
                    onHover={(hovering) => setHoverRhythm(hovering ? option.value : null)}
                    onClick={() => {
                      update('thinkingRhythm', option.value);
                      window.setTimeout(advance, 180);
                    }}
                  />
                ))}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'tone' ? (
          <motion.div
            key="tone"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 5"
              title="How should the app talk to you?"
              subtitle="This calibrates the companion voice. We will not announce the change, we will just behave differently."
              step={5}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {toneOptions.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    body={option.body}
                    sample={option.sample}
                    selected={answers.companionTone === option.value}
                    onClick={() => {
                      update('companionTone', option.value);
                      window.setTimeout(advance, 180);
                    }}
                  />
                ))}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'mascot' ? (
          <motion.div
            key="mascot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12"
          >
            <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
              <button
                type="button"
                onClick={() => setMascotAwake(true)}
                className="rounded-full p-4 transition hover:scale-[1.02]"
              >
                <FloatingCompanion
                  awake={mascotAwake}
                  reaction={mascotAwake ? mascotReaction : undefined}
                />
              </button>
              {mascotAwake ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6 rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_30px_120px_-56px_var(--app-glow)]"
                >
                  <p className="font-editorial text-3xl leading-tight sm:text-5xl">
                    I&apos;ve been calibrated to you.
                    <br />
                    <span className="italic text-[var(--app-accent-strong)]">
                      I know why you came.
                    </span>
                  </p>
                  <p className="mx-auto max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
                    I know what kind of voice you want. I&apos;m ready when you are. What should I
                    call you?
                  </p>

                  <input
                    value={answers.displayName}
                    onChange={(event) => update('displayName', event.target.value)}
                    placeholder="What name do you carry?"
                    className="mx-auto block w-full max-w-xl rounded-full border border-[var(--app-border)] bg-black/20 px-6 py-4 text-center text-lg text-[var(--app-text)] placeholder:text-white/25"
                  />
                  <p className="text-sm text-[var(--app-text-muted)]">
                    The companion will use this. Nobody else will ever see it.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={retreat}
                      className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!answers.displayName.trim()) {
                          setError('Give the companion the name you want it to use.');
                          return;
                        }
                        advance();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-3 font-semibold text-[#120d0a]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  {error ? <p className="text-sm text-red-200">{error}</p> : null}
                </motion.div>
              ) : (
                <div className="text-sm uppercase tracking-[0.34em] text-[var(--app-text-muted)]">
                  The screen is empty on purpose. Tap the companion.
                </div>
              )}
            </div>
          </motion.div>
        ) : null}

        {currentStep === 'universe' ? (
          <motion.div
            key="universe"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Naming"
              title={`What do you want to call this place, ${answers.displayName || 'traveler'}?`}
              subtitle="Once you name the universe, that title becomes the banner over everything that follows."
              step={6}
            >
              <div className="space-y-6">
                <input
                  value={answers.universeName}
                  onChange={(event) => update('universeName', event.target.value)}
                  placeholder="Name it what it feels like"
                  className="w-full rounded-[1.8rem] border border-[var(--app-border)] bg-black/15 px-6 py-5 text-xl text-[var(--app-text)] placeholder:text-white/25"
                />
                <div className="flex flex-wrap gap-3">
                  {['The Vault', `${answers.displayName || 'My'}\'s Mind`, 'The Unnamed'].map(
                    (suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => update('universeName', suggestion)}
                        className="rounded-full border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text-muted)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-text)]"
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={retreat}
                    className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!answers.universeName.trim()) {
                        setError('Give this place a name before we go further.');
                        return;
                      }
                      advance();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-3 font-semibold text-[#120d0a]"
                  >
                    Lock in the universe
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {error ? <p className="text-sm text-red-200">{error}</p> : null}
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 6 (Optional)"
              title="I'll know this is working when I..."
              subtitle="This is the first skippable answer. Write your ideal outcome in your own words or tap a suggestion to begin."
              step={7}
            >
              <div className="space-y-6">
                <textarea
                  value={answers.successDefinition}
                  onChange={(event) => update('successDefinition', event.target.value)}
                  placeholder={successPlaceholders[activePlaceholderIndex]}
                  className="min-h-40 w-full rounded-[1.8rem] border border-[var(--app-border)] bg-black/15 px-6 py-5 text-lg text-[var(--app-text)] placeholder:text-white/25"
                />
                <div className="flex flex-wrap gap-3">
                  {successChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => update('successDefinition', chip)}
                      className="rounded-full border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text-muted)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-text)]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={retreat}
                    className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={advance}
                      className="text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                    >
                      Skip this one
                    </button>
                    <button
                      type="button"
                      onClick={advance}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-3 font-semibold text-[#120d0a]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'context' ? (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <QuestionFrame
              kicker="Question 7 (Optional)"
              title="Anything you'd like your journal to know about you?"
              subtitle="A word, a feeling, a goal. Totally optional. Totally yours."
              step={7}
            >
              <div className="space-y-6">
                <textarea
                  value={answers.journalContext}
                  onChange={(event) => update('journalContext', event.target.value)}
                  placeholder="I am going through a career change and want to stay grounded..."
                  className="min-h-36 w-full rounded-[1.8rem] border border-[var(--app-border)] bg-black/15 px-6 py-5 text-lg text-[var(--app-text)] placeholder:text-white/25"
                />
                <div className="flex flex-wrap gap-3">
                  {contextChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => update('journalContext', chip)}
                      className="rounded-full border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text-muted)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-text)]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={retreat}
                    className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={advance}
                      className="text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                    >
                      Skip this one
                    </button>
                    <button
                      type="button"
                      onClick={advance}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-3 font-semibold text-[#120d0a]"
                    >
                      Finish questions
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </QuestionFrame>
          </motion.div>
        ) : null}

        {currentStep === 'entry' ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-4xl rounded-[2.6rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_36px_140px_-70px_var(--app-glow)] sm:p-10">
              <div className="mb-8 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--app-accent)]">
                  {answers.universeName || 'Your universe'} is waiting
                </p>
                <h1 className="mt-4 font-editorial text-4xl sm:text-6xl">
                  What&apos;s actually on your mind right now?
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
                  One glowing rectangle. One cursor. One thought to start everything.
                </p>
              </div>

              <div className="mb-6 flex justify-end">
                <FloatingCompanion awake compact reaction={mascotReaction} />
              </div>

              <textarea
                value={answers.firstEntry}
                onChange={(event) => update('firstEntry', event.target.value)}
                placeholder={entryPlaceholders[activePlaceholderIndex]}
                className="min-h-56 w-full rounded-[2rem] border border-[var(--app-border)] bg-black/15 px-6 py-6 text-lg leading-8 text-[var(--app-text)] placeholder:text-white/25"
              />

              {error ? (
                <div className="mt-4 rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={retreat}
                  className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void finishOnboarding()}
                  disabled={completeOnboarding.isPending || createEntry.isPending}
                  className="inline-flex items-center gap-3 rounded-full bg-[var(--app-accent)] px-8 py-4 font-semibold text-[#120d0a] disabled:opacity-50"
                >
                  {completeOnboarding.isPending || createEntry.isPending
                    ? 'Igniting your first node...'
                    : 'Genesis Complete'}
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {currentStep === 'genesis' ? (
          <motion.div
            key="genesis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
          >
            <div className="absolute h-80 w-80 rounded-full bg-[var(--app-accent-soft)] blur-[120px] animate-pulse" />
            <motion.div
              initial={{ scale: 0.2, opacity: 0.4 }}
              animate={{ scale: [0.2, 1.4, 2.4], opacity: [0.4, 1, 0] }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
              className="absolute h-32 w-32 rounded-full border border-[var(--app-accent)]"
            />
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1, 0.82, 1] }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle,var(--app-accent-strong),var(--app-accent)_55%,transparent_72%)] shadow-[0_0_120px_var(--app-glow)]"
            />
            <div className="absolute bottom-20 text-center">
              <p className="text-xs uppercase tracking-[0.42em] text-[var(--app-text-muted)]">
                {answers.universeName} · Node #001 · Genesis Complete
              </p>
              <p className="mt-5 font-editorial text-4xl">
                Your first thought just became gravity.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
