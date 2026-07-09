'use client';

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

export type MascotEmotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'surprised'
  | 'curious'
  | 'loved'
  | 'worried'
  | 'focused'
  | 'sleepy'
  | 'inspired'
  | 'content'
  | 'thankful'
  | 'confident'
  | 'shy'
  | 'hopeful'
  | 'overwhelmed'
  | 'relaxed'
  | 'energetic'
  | 'down'
  | 'upbeat'
  | 'playful'
  | 'determined'
  | 'atPeace'
  | 'thinking'
  | 'idea'
  | 'reading'
  | 'working'
  | 'listening'
  | 'celebrating'
  | 'loving'
  | 'focusMode'
  | 'waving'
  | 'jumping'
  | 'floating'
  | 'running'
  | 'flying'
  | 'twirling'
  | 'morning'
  | 'rainyDay'
  | 'relaxTime'
  | 'nightTime'
  | 'onTheGo'
  | 'selfCare'
  | 'appIcon'
  | 'loading'
  | 'emptyState'
  | 'success'
  | 'notification'
  | 'welcome'
  | 'bored'
  | 'writing'
  | 'spectral';

interface OrbiMascotBaseProps {
  emotion: MascotEmotion;
  isHovered?: boolean;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
  blink: boolean;
  message?: string;
  compact?: boolean;
  label?: string;
}

const EXACT_BODY_PATH =
  'M 76.04 103.38 C 74.33 101.94 72.27 99.49 71.46 97.93 C 69.51 94.15 69.58 86.04 71.60 83.16 C 72.48 81.90 73.02 80.69 72.81 80.47 C 72.59 80.25 70.18 80.76 67.45 81.61 C 64.10 82.65 59.85 83.02 54.31 82.75 C 47.32 82.42 45.02 81.82 38.60 78.65 C 24.27 71.56 17.60 58.83 23.09 49.05 C 29.20 38.18 46.15 35.91 65.60 43.36 C 74.51 46.77 84.93 52.43 88.60 55.84 C 89.67 56.84 91.78 58.46 93.28 59.45 C 95.97 61.21 96.05 61.20 99.61 58.37 C 110.16 49.98 119.97 44.84 132.08 41.37 C 139.56 39.22 142.65 38.84 149.41 39.19 C 156.46 39.56 158.26 40.04 161.98 42.56 C 168.37 46.89 170.23 49.89 170.23 55.86 C 170.23 64.94 162.51 74.52 151.00 79.74 C 143.63 83.08 131.21 83.95 124.13 81.64 C 121.38 80.74 118.92 80.00 118.67 80.00 C 118.42 80.00 119.10 81.69 120.17 83.75 C 125.93 94.77 115.54 109.37 105.03 105.01 C 102.08 103.79 97.73 99.49 96.70 96.79 C 96.39 95.96 95.07 96.85 93.02 99.27 C 87.02 106.35 81.23 107.75 76.04 103.38 Z';

const sleepyStates: MascotEmotion[] = ['sleepy', 'relaxTime', 'nightTime'];
const closedEyeStates: MascotEmotion[] = [
  'sad',
  'sleepy',
  'worried',
  'thinking',
  'reading',
  'working',
  'listening',
  'relaxTime',
  'nightTime',
];
const smileStates: MascotEmotion[] = [
  'happy',
  'content',
  'thankful',
  'celebrating',
  'loving',
  'welcome',
  'selfCare',
  'morning',
];
const lineEyeStates: MascotEmotion[] = ['calm', 'focused', 'focusMode', 'determined', 'success'];
const starEyeStates: MascotEmotion[] = ['inspired', 'idea', 'celebrating'];
const heartEyeStates: MascotEmotion[] = ['loved', 'loving', 'selfCare'];
const dotEyeStates: MascotEmotion[] = ['neutral', 'curious', 'surprised', 'floating', 'waving'];
const chevronEyeStates: MascotEmotion[] = ['excited', 'content', 'upbeat', 'playful'];

function Eye({
  emotion,
  side,
  blink,
  pupilX,
  pupilY,
}: {
  emotion: MascotEmotion;
  side: 'left' | 'right';
  blink: boolean;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
}) {
  const mirror = side === 'left' ? 1 : -1;
  const path = useMemo(() => {
    if (blink) return 'M -4 0 Q 0 1 4 0';
    if (smileStates.includes(emotion)) return 'M -5 2 Q 0 -4 5 2';
    if (closedEyeStates.includes(emotion)) return 'M -5 0 Q 0 4 5 0';
    if (lineEyeStates.includes(emotion)) return 'M -5 0 L 5 0';
    if (chevronEyeStates.includes(emotion)) {
      return side === 'left' ? 'M -4 -5 L 3 0 L -4 5' : 'M 4 -5 L -3 0 L 4 5';
    }
    if (emotion === 'shy') return 'M -4 1 Q 0 -2 4 1';
    return null;
  }, [blink, emotion, side]);

  if (heartEyeStates.includes(emotion)) {
    return (
      <path
        d="M 0 4 C -7 -2 -8 -8 -4 -10 C -2 -12 0 -9 0 -7 C 0 -9 2 -12 4 -10 C 8 -8 7 -2 0 4 Z"
        fill="#111"
        transform={`scale(${mirror},1)`}
      />
    );
  }

  if (starEyeStates.includes(emotion)) {
    return (
      <path
        d="M 0 -8 L 2 -2 L 8 -2 L 3 1 L 5 7 L 0 4 L -5 7 L -3 1 L -8 -2 L -2 -2 Z"
        fill="#111"
      />
    );
  }

  if (!path || dotEyeStates.includes(emotion)) {
    return (
      <motion.circle
        cx={0}
        cy={0}
        r={blink ? 0.7 : emotion === 'surprised' ? 3.5 : 2.6}
        fill="#111"
        style={{
          x: emotion === 'curious' ? pupilX : undefined,
          y: emotion === 'curious' ? pupilY : undefined,
        }}
      />
    );
  }

  return (
    <path
      d={path}
      fill="none"
      stroke="#111"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={emotion === 'excited' || emotion === 'content' ? 3.6 : 3}
    />
  );
}

function Face({
  emotion,
  blink,
  pupilX,
  pupilY,
}: {
  emotion: MascotEmotion;
  blink: boolean;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
}) {
  const leftX = emotion === 'surprised' ? 76 : 75;
  const rightX = emotion === 'surprised' ? 117 : 118;
  const y = emotion === 'surprised' ? 68 : 70;

  return (
    <g>
      <g transform={`translate(${leftX} ${y})`}>
        <Eye emotion={emotion} side="left" blink={blink} pupilX={pupilX} pupilY={pupilY} />
      </g>
      <g transform={`translate(${rightX} ${y})`}>
        <Eye emotion={emotion} side="right" blink={blink} pupilX={pupilX} pupilY={pupilY} />
      </g>

      {emotion === 'surprised' ? (
        <g fill="none" stroke="#e7e7e7" strokeLinecap="round" strokeWidth="2.4">
          <path d="M 130 49 L 131 44" />
          <path d="M 136 52 L 140 48" />
          <path d="M 124 52 L 121 48" />
        </g>
      ) : null}

      {emotion === 'worried' || emotion === 'overwhelmed' ? (
        <path
          d="M 72 62 Q 77 58 82 63 M 112 63 Q 117 58 122 62"
          fill="none"
          stroke="#111"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ) : null}

      {emotion === 'shy' ? (
        <g fill="none" stroke="#c9c9c9" strokeLinecap="round" strokeWidth="1.6">
          <path d="M 71 81 L 68 86" />
          <path d="M 77 82 L 74 88" />
          <path d="M 114 82 L 111 88" />
          <path d="M 120 81 L 117 86" />
        </g>
      ) : null}
    </g>
  );
}

function Accessory({ emotion }: { emotion: MascotEmotion }) {
  if (sleepyStates.includes(emotion)) {
    return (
      <motion.g
        initial={false}
        animate={{ y: [-1, -9, -1], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <text x="125" y="38" fill="#e7e7e7" fontSize="11" fontWeight="700">
          z
        </text>
        <text x="136" y="28" fill="#e7e7e7" fontSize="9" fontWeight="700">
          z
        </text>
      </motion.g>
    );
  }

  if (
    emotion === 'inspired' ||
    emotion === 'idea' ||
    emotion === 'celebrating' ||
    emotion === 'hopeful'
  ) {
    return (
      <g fill="#e7e7e7">
        <path d="M 132 25 L 135 34 L 144 37 L 135 40 L 132 49 L 129 40 L 120 37 L 129 34 Z" />
        <circle cx="150" cy="30" r="1.4" />
        <circle cx="116" cy="28" r="1.2" />
      </g>
    );
  }

  if (emotion === 'thankful') {
    return (
      <g stroke="#e7e7e7" strokeLinecap="round" strokeWidth="2.2">
        <path d="M 92 38 L 92 27" />
        <path d="M 78 43 L 69 35" />
        <path d="M 106 43 L 115 35" />
      </g>
    );
  }

  if (emotion === 'confident' || emotion === 'waving') {
    return (
      <g stroke="#e7e7e7" strokeLinecap="round" strokeWidth="2">
        <path d="M 38 66 L 30 64" />
        <path d="M 39 73 L 31 76" />
        <path d="M 154 66 L 162 64" />
        <path d="M 153 73 L 161 76" />
      </g>
    );
  }

  if (emotion === 'overwhelmed') {
    return (
      <path
        d="M 89 35 C 78 25 101 22 91 36 C 82 48 111 47 101 31 C 93 18 74 34 92 44 C 110 55 122 31 103 29"
        fill="none"
        stroke="#e7e7e7"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    );
  }

  if (emotion === 'relaxed') {
    return (
      <g stroke="#e7e7e7" strokeLinecap="round" strokeWidth="1.8">
        <path d="M 24 79 C 34 76 42 76 52 79" />
        <path d="M 141 79 C 151 76 159 76 169 79" />
      </g>
    );
  }

  if (emotion === 'atPeace') {
    return (
      <path
        d="M 28 104 C 59 117 135 117 166 104"
        fill="none"
        stroke="#e7e7e7"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    );
  }

  if (emotion === 'playful') {
    return (
      <path
        d="M 126 97 C 134 105 142 97 149 104"
        fill="none"
        stroke="#e7e7e7"
        strokeLinecap="round"
        strokeWidth="2"
      />
    );
  }

  if (emotion === 'running' || emotion === 'flying' || emotion === 'energetic') {
    return (
      <g stroke="#e7e7e7" strokeLinecap="round" strokeWidth="1.8" opacity="0.78">
        <path d="M 31 79 L 8 91" />
        <path d="M 35 89 L 12 104" />
        <path d="M 42 99 L 22 113" />
      </g>
    );
  }

  if (emotion === 'twirling') {
    return (
      <g fill="none" stroke="#e7e7e7" strokeLinecap="round" strokeWidth="1.5">
        <path d="M 30 79 C 16 84 15 95 31 99" />
        <path d="M 162 78 C 177 83 178 95 162 100" />
        <path d="M 88 115 C 98 122 111 120 121 113" />
      </g>
    );
  }

  if (emotion === 'focusMode') {
    return (
      <g fill="none" stroke="#e7e7e7" strokeLinecap="round" strokeWidth="1.8">
        <path d="M 34 45 L 24 45 L 24 55" />
        <path d="M 159 45 L 169 45 L 169 55" />
        <path d="M 34 103 L 24 103 L 24 93" />
        <path d="M 159 103 L 169 103 L 169 93" />
      </g>
    );
  }

  return null;
}

function Scene({ emotion }: { emotion: MascotEmotion }) {
  if (emotion === 'morning') {
    return (
      <g fill="none" stroke="#777" strokeLinecap="round" strokeWidth="1.6">
        <path d="M 10 112 C 42 98 70 99 94 111" />
        <path d="M 5 97 Q 20 75 36 97" />
        <path d="M 8 97 L 0 97 M 19 86 L 15 77 M 31 86 L 37 77 M 25 83 L 25 72" />
      </g>
    );
  }

  if (emotion === 'rainyDay') {
    return (
      <g fill="none" stroke="#777" strokeLinecap="round" strokeWidth="1.5">
        <path d="M 42 33 C 52 18 83 18 90 38 C 103 38 111 48 106 61" />
        <path d="M 91 58 C 105 51 126 56 136 70 C 145 70 151 76 151 84" />
        <path d="M 54 72 L 49 86 M 71 70 L 66 84 M 88 72 L 83 88" />
      </g>
    );
  }

  if (emotion === 'nightTime') {
    return (
      <g>
        <path d="M 48 106 C 41 74 63 50 94 48 C 121 48 144 70 144 106 Z" fill="#242424" />
        <path
          d="M 133 35 C 125 40 123 50 131 56 C 120 56 113 45 118 35 C 121 28 128 25 133 35 Z"
          fill="#e7e7e7"
        />
        <g fill="#e7e7e7">
          <circle cx="62" cy="57" r="1.4" />
          <circle cx="78" cy="48" r="1.2" />
          <circle cx="130" cy="67" r="1.2" />
        </g>
      </g>
    );
  }

  if (emotion === 'relaxTime') {
    return (
      <g fill="none" stroke="#777" strokeLinecap="round" strokeWidth="1.7">
        <path d="M 30 98 C 37 76 70 76 78 96 C 89 91 105 96 108 108 L 25 108" />
        <path d="M 13 106 L 19 106" />
        <path d="M 15 91 C 23 83 36 84 42 94" />
      </g>
    );
  }

  if (emotion === 'onTheGo') {
    return (
      <g fill="none" stroke="#777" strokeLinecap="round" strokeWidth="1.6">
        <path d="M 116 73 L 131 83 L 126 107 L 104 108 L 99 84 Z" />
        <path d="M 111 73 L 111 62 L 125 62 L 126 78" />
        <path d="M 20 81 L 5 77" />
      </g>
    );
  }

  return null;
}

function bodyMotion(emotion: MascotEmotion, isHovered?: boolean) {
  if (emotion === 'jumping' || emotion === 'upbeat') {
    return { y: [0, -20, 0], scale: [1, 1.04, 1] };
  }
  if (emotion === 'floating' || emotion === 'flying') {
    return { y: [0, -12, 0], rotate: [-2, 2, -2] };
  }
  if (emotion === 'running' || emotion === 'energetic') {
    return { x: [-4, 5, -4], y: [0, -4, 0], rotate: [-10, -4, -10] };
  }
  if (emotion === 'down') {
    return { y: [10, 14, 10], rotate: [0, -1, 0] };
  }
  if (emotion === 'excited' || emotion === 'twirling') {
    return { y: [0, -6, 0], rotate: [-4, 4, -4], scale: [1, 1.05, 1] };
  }
  if (isHovered) return { y: [0, -6, 0], rotate: [-1, 1, -1] };
  return { y: [0, -5, 0], rotate: 0 };
}

export function OrbiMascotBase({
  emotion,
  isHovered,
  pupilX,
  pupilY,
  blink,
  message,
  compact = false,
  label,
}: OrbiMascotBaseProps) {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const size = compact ? 132 : 260;
  const svgWidth = compact ? 132 : 232;
  const svgHeight = compact ? 108 : 190;
  const duration = sleepyStates.includes(emotion) || emotion === 'atPeace' ? 4.8 : 2.8;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    const newSparks = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 92,
      y: (Math.random() - 0.5) * 70,
    }));
    setSparks(newSparks);
    setTimeout(() => setSparks([]), 900);
  };

  if (!isClient) return null;

  return (
    <button
      type="button"
      className="relative flex select-none items-center justify-center border-0 bg-transparent p-0"
      style={{ width: size, height: size }}
      onClick={handleClick}
      aria-label={label ?? 'Interact with Soouls mascot'}
    >
      <motion.div
        className="absolute rounded-full bg-white/12 blur-2xl"
        style={{ width: compact ? 96 : 178, height: compact ? 74 : 138 }}
        animate={{ opacity: [0.1, 0.26, 0.1], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: compact ? -78 : -126, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            className="absolute z-30 min-w-[220px] max-w-[330px] rounded-[8px] border border-white/15 bg-[#111]/90 px-5 py-4 text-center shadow-[0_22px_70px_rgba(0,0,0,.45)] backdrop-blur-xl"
          >
            <p className="text-[12px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-white/86">
              {message}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.svg
        aria-hidden="true"
        viewBox="0 0 193 158"
        className="relative z-10 overflow-visible"
        style={{ width: svgWidth, height: svgHeight }}
        animate={bodyMotion(emotion, isHovered)}
        transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <defs>
          <filter id="soouls-mascot-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.42" />
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#fff" floodOpacity="0.14" />
          </filter>
        </defs>

        <Scene emotion={emotion} />
        <Accessory emotion={emotion} />

        <g filter="url(#soouls-mascot-shadow)">
          <path d={EXACT_BODY_PATH} fill="#e7e7e7" />
          <path
            d="M 96.5 60.8 L 96.5 104.2"
            stroke="#cecece"
            strokeLinecap="round"
            strokeWidth="1.35"
          />
        </g>

        <Face emotion={emotion} blink={blink} pupilX={pupilX} pupilY={pupilY} />

        {emotion === 'working' ? (
          <g>
            <rect x="68" y="80" width="58" height="28" rx="2" fill="#d9d9d9" />
            <path d="M 68 108 L 126 108" stroke="#777" strokeWidth="1" />
            <path
              d="M 94 91 C 96 87 102 87 103 92 C 101 97 97 100 94 102 C 90 99 86 96 85 92 C 86 87 92 87 94 91 Z"
              fill="#111"
            />
          </g>
        ) : null}

        {emotion === 'reading' ? (
          <g>
            <path
              d="M 58 82 C 73 79 85 83 96 92 L 96 113 C 84 105 72 101 58 104 Z"
              fill="#e7e7e7"
              stroke="#777"
              strokeWidth="1"
            />
            <path
              d="M 96 92 C 107 83 119 79 135 82 L 135 104 C 120 101 108 105 96 113 Z"
              fill="#e7e7e7"
              stroke="#777"
              strokeWidth="1"
            />
          </g>
        ) : null}

        {emotion === 'listening' ? (
          <g fill="none" stroke="#777" strokeWidth="2">
            <path d="M 48 66 C 48 48 63 37 83 37" />
            <path d="M 145 66 C 145 48 130 37 110 37" />
            <path d="M 48 66 L 48 80" />
            <path d="M 145 66 L 145 80" />
          </g>
        ) : null}

        {emotion === 'loving' ? (
          <path
            d="M 128 102 C 112 90 120 74 132 78 C 137 80 139 85 140 90 C 143 85 146 80 151 78 C 163 74 171 90 155 102 L 140 116 Z"
            fill="#e7e7e7"
            stroke="#d6d6d6"
            strokeWidth="1"
          />
        ) : null}

        <AnimatePresence>
          {sparks.map((spark) => (
            <motion.circle
              key={spark.id}
              cx="96"
              cy="72"
              r="1.6"
              fill="#fff"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0, x: spark.x, y: spark.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </motion.svg>
    </button>
  );
}

export function MascotPreview({
  emotion = 'happy',
  label,
}: {
  emotion?: MascotEmotion;
  label?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pupilX = useSpring(x, { damping: 40, stiffness: 250 });
  const pupilY = useSpring(y, { damping: 40, stiffness: 250 });

  return (
    <OrbiMascotBase
      emotion={emotion}
      blink={false}
      pupilX={pupilX}
      pupilY={pupilY}
      compact
      label={label}
    />
  );
}
